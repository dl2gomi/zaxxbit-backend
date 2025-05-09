const express = require('express');
const router = express.Router();

const userRouter = require('./user');
const referRouter = require('./refer');
const ticketRouter = require('./ticket');
const cryptoRouter = require('./crypto');

// subpaths
router.use('/users', userRouter); // /api/v1/users/*
router.use('/refer', referRouter); // /api/v1/refer/*
router.use('/tickets', ticketRouter); // /api/v1/tickets/*
router.use('/crypto', cryptoRouter); // /api/v1/crypto/*

module.exports = router;
