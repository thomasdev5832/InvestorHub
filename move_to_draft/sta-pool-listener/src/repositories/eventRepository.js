const { connectDB } = require('../config/db/mongodbConnection');
const logger = require('../utils/logger');

class EventRepository {
    async connect() {
        try {
            const db = await connectDB();
            this.collection = db.collection('events');
            logger.info('EventRepository connected to MongoDB successfully.');
        } catch (error) {
            logger.error('EventRepository connection error:', error);
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