const express = require('express');
const config = require('./config/config');
const logger = require('./utils/logger');
const eventRepository = require('./repositories/eventRepository');
const poolRepository = require('./repositories/poolRepository');
const blockchainController = require('./controllers/blockchainController');
const metricsRoutes = require('./routes/metricsRoutes');

const app = express();

// Use the metrics route to expose Prometheus metrics.
app.use(metricsRoutes);

const startApp = async () => {
    try {
        await eventRepository.connect();
        await poolRepository.connect();
        blockchainController.startEventListeners();

        app.listen(config.metricsPort, () => {
            logger.info(`Metrics server running on port ${config.metricsPort}`);
        });

        // Process-level error handling
        process.on('uncaughtException', (err) => {
            logger.error("Uncaught Exception:", err);
            process.exit(1);
        });

        process.on('unhandledRejection', (err) => {
            logger.error("Unhandled Rejection:", err);
            process.exit(1);
        });
    } catch (error) {
        logger.error("Application failed to start:", error);
        process.exit(1);
    }
};

startApp();