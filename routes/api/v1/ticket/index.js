const express = require('express');
const router = express.Router();

const { ticketController } = require('@/controllers/v1');
const { auth } = require('@/middlewares');

router.post('/', auth, ticketController.store); // POST /api/v1/tickets
router.get('/', auth, ticketController.list); // GET /api/v1/tickets
router.get('/:id', auth, ticketController.show); // GET /api/v1/tickets/*
router.put('/:id', auth, ticketController.addMessage); // PUT /api/v1/tickets/*
router.post('/:id/close', auth, ticketController.close); // POST /api/v1/tickets/*/close

module.exports = router;
