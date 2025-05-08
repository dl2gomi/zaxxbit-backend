const { User } = require('@/models');

const info = async (req, res) => {
  return res.json({
    code: req.user.profile.referCode,
    referedBy: req.user.profile.referedBy,
  });
};

const check = async (req, res) => {
  const { promo } = req.body;

  try {
    if (promo === req.user.profile.referCode) {
      return res.status(400).json({
        message: 'Cannot set yourself as promo!',
      });
    }

    const user = await User.findOne({ 'profile.referCode': promo });

    if (!user) {
      return res.status(400).json({
        message: 'Cannot find this user!',
      });
    }

    req.user.profile.referedBy = user.id;

    await req.user.save();

    return res.json({
      message: 'Successfully set your promo!',
      code: req.user.profile.referCode,
      referedBy: req.user.profile.referedBy,
    });
  } catch (err) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
  return res.json({
    code: req.user.profile.referCode,
    referedBy: req.user.profile.referedBy,
  });
};

module.exports = {
  info,
  check,
};
