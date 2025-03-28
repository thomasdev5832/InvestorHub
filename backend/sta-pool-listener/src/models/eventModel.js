class BlockchainEvent {
    constructor({ node, contract, topic, log, timestamp }) {
        this.node = node;
        this.contract = contract;
        this.topic = topic;
        this.log = log;
        this.timestamp = timestamp || new Date();
    }
}

module.exports = BlockchainEvent;  