const mongoose = require('mongoose');
const { success } = require('../utils/apiResponse');

function healthCheck(_req, res) {
  return success(res, {
    status: 'healthy',
    uptime: process.uptime(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
  });
}

module.exports = { healthCheck };
