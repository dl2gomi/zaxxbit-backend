const axios = require('axios');

/**
 * @param {string[]} tokens - Array of token symbols (e.g. ['BTC', 'ETH', 'SOL'])
 * @param {string} base - Base token (e.g. 'USDT')
 * @returns {Promise<Object[]>} - Array of pair info objects
 */
const getPairData = async (tokens, base = 'USDT') => {
  try {
    const response = await axios.get('https://api.mexc.com/api/v3/ticker/24hr');
    const allPairs = response.data;

    const upperBase = base.toUpperCase();

    const result = tokens
      .map((symbol) => {
        const pairSymbol = `${symbol.toUpperCase()}${upperBase}`;
        const pair = allPairs.find((p) => p.symbol === pairSymbol);

        if (!pair) return null;

        return {
          symbol: symbol.toLowerCase(),
          pair: pairSymbol,
          pair_name: `${symbol.toUpperCase()}/${upperBase}`,
          price: parseFloat(pair.lastPrice),
          percent_change_24h: parseFloat(pair.priceChangePercent),
          high_24h: parseFloat(pair.highPrice),
          low_24h: parseFloat(pair.lowPrice),
          volume_24h: parseFloat(pair.volume),
        };
      })
      .filter(Boolean); // Remove nulls if pair not found

    return result;
  } catch (err) {
    throw new Error('Failed to fetch pair data: ' + err.message);
  }
};

module.exports = {
  getPairData,
};
