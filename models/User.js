const mongoose = require('mongoose');

// Define the Profile sub-schema
const profileSchema = new mongoose.Schema(
  {
    referCode: { type: String, default: null },
    referedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    seed: { type: String, default: null },
  },
  { _id: false }
);

// Define wallet sub-schema
const walletSchema = new mongoose.Schema({
  btc: {
    balance: { type: BigInt, default: 0 },
    address: { type: String, default: null },
    privateKey: { type: String, default: null },
  },
  eth: {
    balance: { type: BigInt, default: 0 },
    address: { type: String, default: null },
    privateKey: { type: String, default: null },
  },
  bnb: {
    balance: { type: BigInt, default: 0 },
    address: { type: String, default: null },
    privateKey: { type: String, default: null },
  },
  erc20: {
    balance: { type: BigInt, default: 0 },
    address: { type: String, default: null },
    privateKey: { type: String, default: null },
  },
  bep20: {
    balance: { type: BigInt, default: 0 },
    address: { type: String, default: null },
    privateKey: { type: String, default: null },
  },
  trc20: {
    balance: { type: BigInt, default: 0 },
    address: { type: String, default: null },
    privateKey: { type: String, default: null },
  },
  sol: {
    balance: { type: BigInt, default: 0 },
    address: { type: String, default: null },
    privateKey: { type: String, default: null },
  },
});

// Define the user schema
const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true }, // unique index
    password: { type: String, required: true },
    profile: profileSchema,
    wallet: walletSchema,
  },
  {
    collection: 'users',
    timestamps: true,
  }
);

// Create the User model based on the schema
const User = mongoose.model('User', userSchema);

module.exports = User;
