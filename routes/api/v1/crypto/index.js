const express = require('express');
const router = express.Router();

const { cryptoController } = require('@/controllers/v1');

router.post('/tokensinfo', cryptoController.getTokensInfo);
router.post('/pairsinfo', cryptoController.getPairsInfo);
router.get('/highlight', cryptoController.getHighlights);

module.exports = router;
