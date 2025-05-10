const { getWalletsFromSeed } = require('@/helpers/addresser');
const { randomStringReferCode, generateSeed } = require('@/helpers/generator');
const User = require('@/models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const speakeasy = require('speakeasy');

const JWT_SECRET = process.env.JWT_SECRET;

const register = async (req, res) => {
  const { password, confirmPassword, email, refcode } = req.body;
  try {
    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Check if password is confirmed
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords don't match" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    const referUser = await User.findOne({ 'profile.referCode': refcode });

    // Create a new user
    const user = new User({
      password: hashedPassword,
      email,
    });
    const seed = generateSeed();
    user.profile = {
      referCode: randomStringReferCode(6),
      referedBy: referUser ? referUser.id : null,
      seed,
    };

    const wallets = getWalletsFromSeed(seed);
    user.wallet = {
      btc: {
        ...wallets.bitcoin,
      },
      eth: {
        ...wallets.ethereum,
      },
      bnb: {
        ...wallets.ethereum,
      },
      erc20: {
        ...wallets.ethereum,
      },
      bep20: {
        ...wallets.ethereum,
      },
      trc20: {
        ...wallets.tron,
      },
      sol: {
        ...wallets.solana,
      },
    };

    const secret = speakeasy.generateSecret({
      name: `${process.env.APP_NAME}:${email}`,
      issuer: process.env.APP_NAME,
      length: 10,
    });

    user.tfa = {
      base: secret.base32,
      url: secret.otpauth_url,
    };

    // Save the company to the database
    await user.save();

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '24h' });

    return res.status(201).json({ message: 'Successfully signed up!', email: user.email, token });
  } catch (error) {
    return res.status(500).json({ message: 'Internal Server error', error });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid password' });
    }

    user.profile.lastLogin = new Date();
    user.markModified('profile');
    await user.save();

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '24h' });
    res.json({
      message: 'Successfully signed in!',
      email: user.email,
      token,
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal Server error' });
  }
};

const info = async (req, res) => {
  try {
    return res.json({
      email: req.user.email,
      id: req.user.id,
      tfa: req.user.tfa.enabled,
      balance: Object.values(req.user.wallet)
        .filter((entry) => entry && typeof entry.balance === 'object' && entry.balance.toNumber)
        .reduce((sum, entry) => sum + entry.balance.toNumber(), 0),
      referedBy: req.user.profile.referedBy,
      lastLogin: req.user.profile.lastLogin,
      lastChange: req.user.profile.lastChange,
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal Server error' });
  }
};

const tfaInfo = async (req, res) => {
  try {
    return res.json({
      tfa: req.user.tfa,
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal Server error' });
  }
};

const tfaCheck = async (req, res) => {
  try {
    const { code } = req.body;
    const isVerified = speakeasy.totp.verify({
      secret: req.user.tfa.base,
      encoding: 'base32',
      token: code,
      window: 1,
    });

    if (!isVerified) {
      return res.status(400).json({ message: 'Invalid code' });
    } else {
      req.user.tfa.enabled = true;
      await req.user.save();
      return res.json({ message: 'Successfully enabled 2FA!' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Internal Server error' });
  }
};

const balance = async (req, res) => {
  try {
    return res.json({
      btc: {
        address: req.user.wallet.btc.address,
        balance: req.user.wallet.btc.balance.toString(),
      },
      eth: {
        address: req.user.wallet.eth.address,
        balance: req.user.wallet.eth.balance.toString(),
      },
      bnb: {
        address: req.user.wallet.bnb.address,
        balance: req.user.wallet.bnb.balance.toString(),
      },
      erc20: {
        address: req.user.wallet.erc20.address,
        balance: req.user.wallet.erc20.balance.toString(),
      },
      bep20: {
        address: req.user.wallet.bep20.address,
        balance: req.user.wallet.bep20.balance.toString(),
      },
      trc20: {
        address: req.user.wallet.trc20.address,
        balance: req.user.wallet.trc20.balance.toString(),
      },
      sol: {
        address: req.user.wallet.sol.address,
        balance: req.user.wallet.sol.balance.toString(),
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal Server error' });
  }
};

const update = async (req, res) => {
  try {
    const { first, last, phone, mid, address } = req.body;

    if (!first || !last || !phone) {
      return res.status(400).json({
        message: 'Some fields are missing',
      });
    }

    if (req.user.franchise?.role === 'admin' && (!mid || !address)) {
      return res.status(400).json({
        message: 'Some fields are missing',
      });
    }

    const branch = await Branch.findById(req.user.franchise?.branch);

    if (!req.user.profile) req.user.profile = {};
    req.user.profile.firstName = first;
    req.user.profile.lastName = last;
    req.user.profile.phone = phone;

    if (req.user.franchise?.role === 'admin') {
      branch.merchantId = mid;
      branch.address = address;

      await branch.save();
    }

    await req.user.save();

    return res.json({
      message: 'Successfully updated profile',
      role: !req.user.franchise ? 'super' : req.user.franchise.role,
      title: branch?.title,
      firstName: req.user.profile?.firstName,
      lastName: req.user.profile?.lastName,
      address: req.user.franchise?.role === 'admin' ? branch?.address : undefined,
      email: req.user.email,
      phone: req.user.profile?.phone,
      merchantId: branch?.merchantId,
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal Server error' });
  }
};

const change = async (req, res) => {
  try {
    const { oldPassword, newPassword, confirmPassword } = req.body;

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        message: `Password confirmation doesn't match`,
      });
    }

    const user = await User.findById(req.user._id);
    const isMatch = await bcrypt.compare(oldPassword, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid current password' });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.profile.lastChange = new Date();
    await user.save();

    return res.json({
      message: 'Successfully changed password',
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal Server error' });
  }
};

const updateAvatar = async (req, res) => {
  try {
    if (!req.body.image) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Save the image as a Buffer in the User document
    const user = req.user;

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Save the uploaded image buffer to the user's avatar field
    const avatarBuffer = Buffer.from(req.body.image, 'base64');
    user.profile.avatar = avatarBuffer; // Store the image as a Buffer
    user.markModified('profile.avatar');

    await user.save(); // Save the updated user document

    return res.status(200).json({ message: 'Avatar uploaded successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

const serveAvatar = async (req, res) => {
  try {
    const user = req.user;
    if (!user || !user.profile.avatar) {
      return res.status(404).json({ message: 'Avatar not found' });
    }

    const base64Image = Buffer.from(user.profile.avatar).toString('base64');
    res.json({ image: `data:image/png;base64,${base64Image}` });
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

module.exports = {
  login,
  register,
  info,
  update,
  balance,
  change,
  updateAvatar,
  serveAvatar,
  tfaInfo,
  tfaCheck,
};
