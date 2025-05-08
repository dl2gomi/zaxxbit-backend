const randomstring = require('randomstring');
const crypto = require('crypto');
// const HDKey = require('hdkey');
// const { default: bs58check } = require('bs58check');
// const { bech32 } = require('bech32');
// const chains = require('../helpers/chains');

// Mapping for zpub (BIP84) → xpub (standard BIP32 public key)
// const ZPUB_PREFIX = Buffer.from([0x04, 0xb2, 0x47, 0x46]); // zpub prefix
// const XPUB_PREFIX = Buffer.from([0x04, 0x88, 0xb2, 0x1e]); // xpub prefix

const randomStringBech32 = (length) => {
  return randomstring.generate({
    length,
    charset: 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789',
  });
};

const randomStringReferCode = (length) => {
  return randomstring.generate({
    length,
    charset: 'abcdefghijklmnopqrstuvwxyz0123456789',
  });
};

const generateSecureRandomString = (length) => {
  return crypto.randomBytes(length).toString('hex'); // Generates a hex string of 'length' bytes
};

// Function to generate a master private key and public key
const generateSeed = () => {
  // Generate a random seed
  const seed = crypto.randomBytes(32);

  return seed.toString('base64');
};

// Function to generate an address
// const generateAddress = (base64seed, chain, index, prefix) => {
//   // Generate HD wallet from seed
//   const root = HDKey.fromMasterSeed(Buffer.from(base64seed, 'base64'));

//   // Derive the first two child private keys (m/0'/0' and m/0'/1')
//   const childKey = root.derive(`${chains[chain].derivationPath}/${index}`);

//   // Get the private key (HEX format)
//   const privateKey = childKey.privateKey.toString('hex');

//   // Get the public key
//   const publicKey = childKey.publicKey;

//   // Generate the Litecoin address (Bech32)
//   const alg = chains[chain].addressFormat === 'bech32' ? makeBech32Address : makeBase58Address;
//   const address = alg(publicKey, prefix);

//   return {
//     privateKey,
//     address,
//   };
// };

// const convertZpubToXpub = (zpub) => {
//   const decoded = bs58check.decode(zpub);
//   const xpub = Buffer.concat([XPUB_PREFIX, decoded.slice(4)]); // Replace prefix
//   return bs58check.encode(xpub);
// };

// const generateAddressFromZPub = (zpub, chain, index, prefix) => {
//   // Convert zpub to xpub
//   const xpub = convertZpubToXpub(zpub);

//   // Convert xPub to an HDKey node
//   const root = HDKey.fromExtendedKey(xpub);

//   // Derive the child node at the given index
//   const childKey = root.derive(`${chains[chain].derivationPathBip84}/${index}`);

//   // Get the public key
//   const publicKey = childKey.publicKey;

//   // Generate the Litecoin address (Bech32)
//   const alg = chains[chain].addressFormat === 'bech32' ? makeBech32Address : makeBase58Address;
//   const address = alg(publicKey, prefix);

//   return {
//     address,
//   };
// };

// // Function to generate address from public key hash
// function makeBase58Address(publicKey) {
//   const sha256Hash = crypto.createHash('sha256').update(publicKey).digest();
//   const ripemd160Hash = crypto.createHash('ripemd160').update(sha256Hash).digest();
//   const versionByte = Buffer.from([0x30]); // Version byte for Litecoin (0x30 for P2PKH)
//   const payload = Buffer.concat([versionByte, ripemd160Hash]);
//   const checksum = crypto.createHash('sha256').update(payload).digest();
//   const addressBuffer = Buffer.concat([payload, checksum.slice(0, 4)]);
//   return bs58check.encode(addressBuffer); // Use Base58Check encoding
// }

// // Function to generate Bech32 address from public key
// function makeBech32Address(publicKey, prefix) {
//   const sha256Hash = crypto.createHash('sha256').update(publicKey).digest();
//   const ripemd160Hash = crypto.createHash('ripemd160').update(sha256Hash).digest();
//   const words = [0x00, ...bech32.toWords(ripemd160Hash)];

//   return bech32.encode(prefix, words);
// }

module.exports = {
  randomStringBech32,
  generateSecureRandomString,
  generateSeed,
  // generateAddress,
  // generateAddressFromZPub,
  randomStringReferCode,
};
