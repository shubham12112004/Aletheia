const morgan = require('morgan');
const env = require('../config/env');

module.exports = morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev');
