const { User, Ticket } = require('@/models');
const mongoose = require('mongoose');

const store = async (req, res) => {
  const { category, subject, message } = req.body;

  try {
    if (!['withdraw', 'deposit', 'trading', 'staking', 'account'].includes(category)) {
      return res.status(400).json({
        message: 'The category is not supported.',
      });
    }

    const newTicket = new Ticket({
      user: req.user.id,
      subject,
      category,
      status: 'opened',
      history: [
        {
          message,
          user: req.user.id,
          timeStamp: new Date(),
        },
      ],
    });

    await newTicket.save();

    return res.json({
      message: 'Successfully opened a ticket!',
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: 'Internal Server Error',
    });
  }
};

const show = async (req, res) => {
  const { id } = req.params;

  try {
    // Check if ID is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: 'This ticket does not exist!' });
    }

    const ticket = await (await Ticket.findById(id)).populate('user');

    if (!ticket) {
      return res.status(404).json({
        message: 'This ticket does not exist!',
      });
    }

    if (ticket.user.id !== req.user.id) {
      return res.status(403).json({
        message: 'This is not your ticket.',
      });
    }

    const ticketData = ticket.toObject();
    delete ticketData.user;
    ticketData.user = req.user.id;

    return res.json({ ticket: ticketData });
  } catch (err) {
    return res.status(500).json({
      message: 'Internal Server Error',
    });
  }
};

const addMessage = async (req, res) => {
  try {
    const { message } = req.body;
    const { id } = req.params;

    // Check if ID is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: 'This ticket does not exist!' });
    }

    const ticket = await (await Ticket.findById(id)).populate('user');

    if (!ticket) {
      return res.status(404).json({
        message: 'This ticket does not exist!',
      });
    }

    if (ticket.user.id !== req.user.id) {
      return res.status(403).json({
        message: 'This is not your ticket.',
      });
    }

    ticket.history.push({
      message,
      user: req.user.id,
      timestamp: new Date(),
    });

    await ticket.save();

    const ticketData = ticket.toObject();
    delete ticketData.user;
    ticketData.user = req.user.id;

    return res.json({ ticket: ticketData, message: 'Successfully sent a message' });
  } catch (err) {
    return res.status(500).json({
      message: 'Internal Server Error',
    });
  }
};

const list = async (req, res) => {
  try {
    const tickets = await Ticket.find({ user: req.user.id }).select('-history');

    return res.json({
      tickets,
    });
  } catch (err) {
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

module.exports = {
  store,
  show,
  addMessage,
  list,
};
