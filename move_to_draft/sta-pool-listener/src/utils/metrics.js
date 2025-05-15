const client = require('prom-client');

const eventCounter = new client.Counter({
  name: 'blockchain_events_total',
  help: 'Total number of blockchain events processed',
  labelNames: ['node', 'contract', 'topic']
});

module.exports = { client, eventCounter };