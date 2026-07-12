const cors = require('cors');
const express = require('express');
const helmet = require('helmet');
const env = require('./config/env');
const routes = require('./routes');
const requestLogger = require('./middleware/requestLogger');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const { success } = require('./utils/apiResponse');

function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
  app.use(express.json({ limit: '2mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(requestLogger);

  app.get('/', (_req, res) => {
    return success(res, {
      service: 'AI Investment Research Backend',
      version: '1.0.0',
      environment: env.NODE_ENV,
    });
  });

  app.use('/api', routes);
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

module.exports = createApp;
