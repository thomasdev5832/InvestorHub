class BlockchainPool {
    constructor({ token0, token1, pool, fee, tickSpacing, count, origin }) {
        this.token0 = token0;
        this.token1 = token1;
        this.pool = pool;
        this.fee = fee;
        this.tickSpacing = tickSpacing;
        this.count = count;
        this.origin = origin;
        this.timestamp = new Date();
    }
}

module.exports = BlockchainPool;  