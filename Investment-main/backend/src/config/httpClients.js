const axios = require('axios');

function createHttpClient(baseURL, timeout = 15000) {
  return axios.create({
    baseURL,
    timeout,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  });
}

module.exports = {
  tavilyClient: createHttpClient('https://api.tavily.com', 20000),
  fmpClient: createHttpClient('https://financialmodelingprep.com/api/v3'),
  newsClient: createHttpClient('https://newsapi.org/v2'),
  turnstileClient: createHttpClient('https://challenges.cloudflare.com/turnstile/v0', 10000),
};

