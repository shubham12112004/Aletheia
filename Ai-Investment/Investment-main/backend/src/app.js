const cors = require("cors");
const express = require("express");
const helmet = require("helmet");

const env = require("./config/env");
const routes = require("./routes");
const requestLogger = require("./middleware/requestLogger");
const {
  errorHandler,
  notFoundHandler,
} = require("./middleware/errorHandler");
const { success } = require("./utils/apiResponse");

function createApp() {
  const app = express();

  app.use(helmet());

  // Allow the configured production clients and Vite's local development ports.
  // Vite chooses the next available port when 5173 is already occupied.
  const allowedOrigins = [
    "http://localhost:5173",
    "https://aletheia-rosy.vercel.app",
    env.CLIENT_URL,
  ].filter(Boolean);
  const localViteOrigin = /^http:\/\/(localhost|127\.0\.0\.1):\d+$/;

  app.use(
    cors({
      origin(origin, callback) {
        // Allow Postman, curl, server-to-server requests
        if (!origin) {
          return callback(null, true);
        }

        if (allowedOrigins.includes(origin) || localViteOrigin.test(origin)) {
          return callback(null, true);
        }

        console.log("Blocked Origin:", origin);

        return callback(new Error("Not allowed by CORS"));
      },
      credentials: true,
    })
  );

  app.use(express.json({ limit: "2mb" }));
  app.use(express.urlencoded({ extended: true }));

  app.use(requestLogger);

  app.get("/", (_req, res) => {
    return success(res, {
      service: "AI Investment Research Backend",
      version: "1.0.0",
      environment: env.NODE_ENV,
    });
  });

  app.use("/api", routes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

module.exports = createApp;