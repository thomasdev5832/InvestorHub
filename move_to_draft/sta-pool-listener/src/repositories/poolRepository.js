const { connectDB } = require('../config/db/mongodbConnection');
const logger = require('../utils/logger');

class PoolRepository {
    async connect() {
        try {
            const db = await connectDB();
            this.poolCollection = db.collection('pools');
            logger.info('PoolRepository connected to MongoDB successfully.');

            await this.poolCollection.createIndex({ token0: 1 });
            await this.poolCollection.createIndex({ token1: 1 });
            await this.poolCollection.createIndex({ pool: 1 });
            await this.poolCollection.createIndex({ origin: 1 });
            logger.info('Indexes created for token0, token1, pool and origin.');
        } catch (error) {
            logger.error('PoolRepository connection error:', error);
            throw error;
        }
    }

    async insertPool(poolData) {
        try {
            await this.poolCollection.insertOne(poolData);
            logger.info('Pool data ingested into MongoDB.');
        } catch (error) {
            logger.error('Error inserting pool data into MongoDB:', error);
            throw error;
        }
    }
}

module.exports = new PoolRepository();