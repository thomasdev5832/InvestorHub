class BlockchainEvent {
    constructor({ node, contract, topic, log, args, timestamp }) {
        this.node = node;
        this.contract = contract;
        this.topic = topic;
        this.log = log;
        this.args = args;
        this.timestamp = timestamp || new Date();
    }
}

module.exports = BlockchainEvent;  