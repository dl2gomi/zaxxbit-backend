const { fetchCryptoData, getTop3MarketHighlights } = require('@/helpers/cmc');
const { getPairData } = require('@/helpers/mexc');

const getTokensInfo = async (req, res) => {
  try {
    const { symbols } = req.body;

    if (!Array.isArray(symbols)) {
      return res.status(400).json({ message: 'Tokens need to be provided as an array' });
    }
    const result = await fetchCryptoData(symbols);

    return res.json({
      tokenData: result,
    });
  } catch (err) {
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

const getPairsInfo = async (req, res) => {
  try {
    const { symbols, base } = req.body;

    if (!Array.isArray(symbols)) {
      return res.status(400).json({ message: 'Tokens need to be provided as an array' });
    }
    const result = await getPairData(symbols, base);

    return res.json({
      pairData: result,
    });
  } catch (err) {
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

const getHighlights = async (req, res) => {
  try {
    const result = await getTop3MarketHighlights();

    return res.json({
      highlightData: result,
    });
  } catch (err) {
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

module.exports = {
  getTokensInfo,
  getPairsInfo,
  getHighlights,
};
