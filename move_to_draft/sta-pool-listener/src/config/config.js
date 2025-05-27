require('dotenv').config();

const config = {
  mongoURI: process.env.MONGO_URI,
  nodes: JSON.parse(process.env.NODES),
  contracts: JSON.parse(process.env.CONTRACTS),
  metricsPort: process.env.METRICS_PORT || 3001
};

module.exports = config;