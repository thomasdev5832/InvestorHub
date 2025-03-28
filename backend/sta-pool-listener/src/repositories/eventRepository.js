const { MongoClient } = require('mongodb');
const config = require('../config/config');
const logger = require('../utils/logger');

class EventRepository {
    constructor() {
        this.client = new MongoClient(config.mongoURI);
        this.collection = null;
    }

    async connect() {
        try {
            await this.client.connect();
            const db = this.client.db();
            this.collection = db.collection('pools');
            logger.info("Connected to MongoDB successfully.");
        } catch (error) {
            logger.error("MongoDB connection error:", error);
            throw error;
        }
    }

    async insertEvent(event) {
        try {
            await this.collection.insertOne(event);
            logger.info("Event data ingested into MongoDB.");
        } catch (error) {
            logger.error("Error inserting event data into MongoDB:", error);
            throw error;
        }
    }
}

module.exports = new EventRepository();