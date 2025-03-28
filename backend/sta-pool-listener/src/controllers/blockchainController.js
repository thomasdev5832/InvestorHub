const blockchainService = require('../services/blockchainService');
const logger = require('../utils/logger');

class BlockchainController {
    startEventListeners() {
        try {
            blockchainService.startListeners();
            logger.info("Blockchain event listeners are running indefinitely...");
        } catch (error) {
            logger.error("Error starting blockchain event listeners:", error);
        }
    }
}

module.exports = new BlockchainController();