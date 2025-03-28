const { ethers, JsonRpcProvider } = require('ethers');
const config = require('../config/config');
const eventRepository = require('../repositories/eventRepository');
const BlockchainEvent = require('../models/eventModel');
const { eventCounter } = require('../utils/metrics');
const logger = require('../utils/logger');

// Only for testing purposes
const ABI = require("./abi/pairCreated.json");

class BlockchainService {
    startListeners() {
        config.nodes.forEach(node => {
            const provider = new JsonRpcProvider(node.url);
            logger.info(`Connected to node ${node.name} at ${node.url}`);

            config.contracts.forEach(contract => {
                contract.topics.forEach(topic => {
                    const interfaceParseLog = new ethers.Interface(ABI);
                    const filter = {
                        address: contract.address,
                        topics: [
                            ethers.id(topic)
                        ]
                    };

                    provider.on(filter, async (log) => {
                        logger.info(`Received event from node ${node.name} for contract ${contract.address} with topic ${topic}`);
                        eventCounter.inc({ node: node.name, contract: contract.address, topic });

                        const event = interfaceParseLog.parseLog(log);
                        // logger.info(log);
                        // logger.info(event);
                        logger.info(`Log parsed: ${JSON.stringify(log)}`);
                        logger.info(`Event parsed: ${JSON.stringify(event)}`);

                        const eventData = new BlockchainEvent({
                            node: node.name,
                            contract: contract.address,
                            topic: topic,
                            log: log,
                            timestamp: new Date()
                        });

                        try {
                            await eventRepository.insertEvent(eventData);
                        } catch (error) {
                            logger.error("Failed to ingest event:", error);
                        }
                    });

                    logger.info(`Listener attached for contract ${contract.address} on topic ${topic} using node ${node.name}`);
                });
            });
        });
    }
}

module.exports = new BlockchainService();