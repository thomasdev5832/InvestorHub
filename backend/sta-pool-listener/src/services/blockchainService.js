const { ethers, JsonRpcProvider } = require('ethers');
const config = require('../config/config');
const eventRepository = require('../repositories/eventRepository');
const poolRepository = require('../repositories/poolRepository');
const BlockchainEvent = require('../models/eventModel');
const BlockchainPool = require('../models/poolModel');
const { eventCounter } = require('../utils/metrics');
const logger = require('../utils/logger');

const UNISWAP_V2 = "UNISWAP_V2";
const UNISWAP_V3 = "UNISWAP_V3";
const UNDEFINED_VALUE = -1;

class BlockchainService {
    startListeners() {
        config.nodes.forEach(node => {
            const provider = new JsonRpcProvider(node.url);
            logger.info(`Connected to node ${node.name} at ${node.url}`);

            config.contracts.forEach(contract => {
                contract.topics.forEach(topic => {
                    const interfaceParseLog = new ethers.Interface(contract.abi);
                    const filter = {
                        address: contract.address,
                        topics: [
                            ethers.id(topic)
                        ]
                    };

                    provider.on(filter, async (log) => {
                        logger.info(`Received event from node ${node.name} for contract ${contract.address} with topic ${topic}`);
                        eventCounter.inc({ node: node.name, contract: contract.address, topic });

                        // console.log(log);
                        // logger.info(`Log parsed: ${JSON.stringify(log)}`);
                        const event = interfaceParseLog.parseLog(log);
                        // console.log(event);
                        // logger.info(`Event parsed: ${JSON.stringify(event, (_key, value) => { return typeof value === 'bigint' ? value.toString() : value;})}`);

                        const eventData = new BlockchainEvent({
                            node: node.name,
                            contract: contract.address,
                            topic: topic,
                            log: log,
                            args: event.args,
                            timestamp: new Date()
                        });
                        console.log(eventData);

                        const poolData = new BlockchainPool({
                            token0: event.args[0],
                            token1: event.args[1],
                            pool: UNISWAP_V3 === contract.origin ? event.args[4] : event.args[2],
                            fee: UNISWAP_V3 === contract.origin ? event.args[2] : UNDEFINED_VALUE,
                            tickSpacing: UNISWAP_V3 === contract.origin ? event.args[3] : UNDEFINED_VALUE,
                            count: UNISWAP_V2 === contract.origin ? event.args[3] : UNDEFINED_VALUE,
                            origin: contract.origin
                        });
                        console.log(poolData);

                        try {
                            await eventRepository.insertEvent(eventData);
                            await poolRepository.insertPool(poolData);
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