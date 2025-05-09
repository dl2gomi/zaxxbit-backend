const mongoose = require('mongoose');

// Define the Profile sub-schema
const messageSchema = new mongoose.Schema(
  {
    message: { type: String, required: true },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    timestamp: { type: mongoose.Schema.Types.Date, default: new Date() },
  },
  { _id: false }
);

// Define the user schema
const ticketSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    subject: { type: String, required: true },
    category: {
      type: String,
      enum: ['withdraw', 'staking', 'deposit', 'account', 'trading'],
      required: true,
    },
    status: { type: String, enum: ['opened', 'active', 'closed'], required: true },
    history: { type: [messageSchema], required: true, default: [] },
  },
  {
    collection: 'tickets',
    timestamps: true,
  }
);

// Create the User model based on the schema
const Ticket = mongoose.model('Ticket', ticketSchema);

module.exports = Ticket;
