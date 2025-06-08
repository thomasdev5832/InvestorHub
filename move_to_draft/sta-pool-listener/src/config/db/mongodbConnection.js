const { MongoClient } = require('mongodb');
const config = require('../config');
const logger = require('../../utils/logger');

const client = new MongoClient(config.mongoURI);
let _db = null;

async function connectDB() {
    if (!_db) {
        try {
            await client.connect();
            _db = client.db();
            logger.info('MongoDB connection established successfully.');
        } catch (err) {
            logger.error('MongoDB connection failed:', err);
            throw err;
        }
    }
    return _db;
}

module.exports = { connectDB };