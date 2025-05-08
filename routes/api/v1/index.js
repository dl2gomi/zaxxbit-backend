const express = require('express');
const router = express.Router();

const userRouter = require('./user');
const referRouter = require('./refer');

// subpaths
router.use('/users', userRouter); // /api/v1/users/*
router.use('/refer', referRouter); // /api/v1/refer/*

module.exports = router;
