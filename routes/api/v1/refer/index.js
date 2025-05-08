const express = require('express');
const router = express.Router();

const { referController } = require('@/controllers/v1');
const { auth } = require('@/middlewares');

router.get('/info', auth, referController.info); // /api/v1/refer/info
router.post('/check', auth, referController.check); // /api/v1/refer/check

module.exports = router;
