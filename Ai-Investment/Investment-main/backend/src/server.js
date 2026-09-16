const http = require("http");

const env = require("./config/env");
const connectDatabase = require("./config/database");
const createApp = require("./app");
const { initializeSocket } = require("./socket");
const logger = require("./utils/logger");

async function startServer() {
  try {
    await connectDatabase();

    const app = createApp();

    const server = http.createServer(app);

    initializeSocket(server);

    server.listen(env.PORT, () => {
      logger.info(`Server listening on port ${env.PORT}`);

      console.log("-------------------------------------");
      console.log("Backend Running");
      console.log("PORT:", env.PORT);
      console.log("CLIENT_URL:", env.CLIENT_URL);
      console.log("-------------------------------------");
    });

    process.on("SIGTERM", () => {
      logger.warn("SIGTERM received. Closing server.");

      server.close(() => process.exit(0));
    });
  } catch (error) {
    logger.error("Failed to start server", {
      message: error.message,
      stack: error.stack,
    });

    process.exit(1);
  }
}

startServer();