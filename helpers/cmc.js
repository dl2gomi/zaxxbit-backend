const axios = require('axios');

const API_KEY = process.env.CMC_API_KEY;

const fetchCryptoData = async (symbols) => {
  try {
    const response = await axios.get(
      'https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest',
      {
        headers: {
          'X-CMC_PRO_API_KEY': API_KEY,
        },
        params: {
          symbol: symbols.join(','),
          convert: 'USD',
        },
      }
    );

    const data = response.data.data;
    const result = [];
    for (const symbol of symbols) {
      const token = data[symbol];
      const quote = token.quote.USD;
      result.push({
        name: token.name,
        symbol: token.symbol,
        price: quote.price,
        percent_change_24h: quote.percent_change_24h,
        market_cap: quote.market_cap,
      });
    }

    return result;
  } catch (error) {
    console.error('Error fetching data:', error.response?.data || error.message);
    throw error;
  }
};

const getTop3MarketHighlights = async () => {
  try {
    const url = 'https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest';

    // Step 1: Get top 100 tokens
    const response = await axios.get(url, {
      headers: { 'X-CMC_PRO_API_KEY': API_KEY },
      params: {
        start: 1,
        limit: 100,
        convert: 'USD',
      },
    });

    const data = response.data.data;

    // Step 2: Extract top tokens
    const highlightTokens = [...data]
      .sort((a, b) => b.quote.USD.market_cap - a.quote.USD.market_cap)
      .slice(0, 3);

    const topGainers = [...data]
      .sort((a, b) => b.quote.USD.percent_change_24h - a.quote.USD.percent_change_24h)
      .slice(0, 3);

    const topLosers = [...data]
      .sort((a, b) => a.quote.USD.percent_change_24h - b.quote.USD.percent_change_24h)
      .slice(0, 3);

    const topVolume = [...data]
      .sort((a, b) => b.quote.USD.volume_24h - a.quote.USD.volume_24h)
      .slice(0, 3);

    // Step 3: Collect unique token IDs for logo fetching
    const tokenMap = new Map();
    [...highlightTokens, ...topGainers, ...topLosers, ...topVolume].forEach((t) => {
      tokenMap.set(t.id, t);
    });

    const ids = Array.from(tokenMap.keys()).join(',');

    // Step 4: Fetch logo data
    const infoRes = await axios.get('https://pro-api.coinmarketcap.com/v1/cryptocurrency/info', {
      headers: { 'X-CMC_PRO_API_KEY': API_KEY },
      params: { id: ids },
    });

    const logoMap = infoRes.data.data;

    // Step 5: Add logo URLs to each token
    const attachLogo = (arr) =>
      arr.map((t) => ({
        ...t,
        logo: logoMap[t.id]?.logo || null,
      }));

    return {
      highlightTokens: attachLogo(highlightTokens),
      topGainers: attachLogo(topGainers),
      topLosers: attachLogo(topLosers),
      topVolume: attachLogo(topVolume),
    };
  } catch (err) {
    throw new Error('Failed to fetch top 3 market data: ' + err.message);
  }
};

module.exports = {
  fetchCryptoData,
  getTop3MarketHighlights,
};
