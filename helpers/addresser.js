const crypto = require('crypto');
const hdkey = require('hdkey');
const { bech32 } = require('bech32');
const { default: bs58check } = require('bs58check');
const keccak256 = require('keccak256');
const { ethers } = require('ethers');
const { default: bs58 } = require('bs58');
const { Keypair } = require('@solana/web3.js');

// BIP44 derivation paths
const PATHS = {
  BTC: "m/44'/0'/0'/0/0",
  ETH: "m/44'/60'/0'/0/0",
  TRX: "m/44'/195'/0'/0/0",
  SOL: "m/44'/501'/0'/0'", // Solana path
};

const generateSeed = () => {
  return crypto.randomBytes(32).toString('base64');
};

const getWalletsFromSeed = (base64Seed) => {
  try {
    const seed = Buffer.from(base64Seed, 'base64');
    const root = hdkey.fromMasterSeed(seed);

    // Bitcoin
    const btc = root.derive(PATHS.BTC);
    const btcPubKey = btc.publicKey;
    const sha256 = crypto.createHash('sha256').update(btcPubKey).digest();
    const ripemd160 = crypto.createHash('rmd160').update(sha256).digest();
    const words = bech32.toWords(ripemd160);
    words.unshift(0x00); // witness version 0
    const btcAddress = bech32.encode('bc', words);
    const btcPrivateKey = btc.privateKey.toString('hex');

    // Ethereum
    const eth = root.derive(PATHS.ETH);
    const ethWallet = new ethers.Wallet(eth.privateKey.toString('hex'));
    const ethAddress = ethWallet.address;
    const ethPrivateKey = ethWallet.privateKey;

    // TRON
    const trx = root.derive(PATHS.TRX);
    const trxPubKey = trx.publicKey;
    const trxHash = keccak256(trxPubKey.slice(1)).slice(-20);
    const trxAddress = bs58check.encode(Buffer.concat([Buffer.from([0x41]), trxHash]));
    const trxPrivateKey = trx.privateKey.toString('hex');

    // Solana
    const sol = root.derive(PATHS.SOL);
    const solKeypair = Keypair.fromSeed(sol.privateKey.slice(0, 32)); // Ed25519 requires 32-byte seed
    const solAddress = solKeypair.publicKey.toBase58();
    const solPrivateKey = bs58.encode(solKeypair.secretKey);

    return {
      bitcoin: {
        address: btcAddress,
        privateKey: btcPrivateKey,
      },
      ethereum: {
        address: ethAddress,
        privateKey: ethPrivateKey,
      },
      tron: {
        address: trxAddress,
        privateKey: trxPrivateKey,
      },
      solana: {
        address: solAddress,
        privateKey: solPrivateKey,
      },
    };
  } catch (err) {
    throw err;
  }
};

module.exports = {
  getWalletsFromSeed,
};
