# Staking Aggregator Pool Listener

Log#1
```txt
[2025-03-28T02:33:44.278Z] INFO: Connected to MongoDB successfully.
[2025-03-28T02:33:44.279Z] INFO: Connected to node infura at https://mainnet.infura.io/v3/INFURA_PROJECT_ID
[2025-03-28T02:33:44.281Z] INFO: Listener attached for contract 0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f on topic PairCreated(address,address,address,uint256) using node infura
[2025-03-28T02:33:44.283Z] INFO: Listener attached for contract 0x1F98431c8aD98523631AE4a59f267346ea31F984 on topic PoolCreated(address,address,uint24,int24,address) using node infura
[2025-03-28T02:33:44.283Z] INFO: Blockchain event listeners are running indefinitely...
[2025-03-28T02:33:44.287Z] INFO: Metrics server running on port 3001
```

Log#2
```txt
[2025-03-28T02:33:44.278Z] INFO: Connected to MongoDB successfully.
[2025-03-28T02:33:44.279Z] INFO: Connected to node infura at https://mainnet.infura.io/v3/8d4ae78afd694640ae8fe4227d122d80
[2025-03-28T02:33:44.281Z] INFO: Listener attached for contract 0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f on topic PairCreated(address,address,address,uint256) using node infura
[2025-03-28T02:33:44.283Z] INFO: Listener attached for contract 0x1F98431c8aD98523631AE4a59f267346ea31F984 on topic PoolCreated(address,address,uint24,int24,address) using node infura
[2025-03-28T02:33:44.283Z] INFO: Blockchain event listeners are running indefinitely...
[2025-03-28T02:33:44.287Z] INFO: Metrics server running on port 3001
[2025-03-28T02:40:51.723Z] INFO: Received event from node infura for contract 0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f with topic PairCreated(address,address,address,uint256)
Log {
  provider: JsonRpcProvider {},
  transactionHash: '0x3320c28f23e4f541b5ef454a1f7c9592e1790efd4b31274397eeef98d323cee0',
  blockHash: '0x11ada24e7b0fdb9dad84a1ae4fae886ee68d4102b3517669deb915ef6f59d28a',
  blockNumber: 22142489,
  removed: false,
  address: '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f',
  data: '0x00000000000000000000000047baa8eb5686661e7d66f58987d88bbf81c3028b00000000000000000000000000000000000000000000000000000000000643de',
  topics: [
    '0x0d3648bd0f6ba80134a33ba9275ac585d9d315f0ad8355cddefde31afa28d0e9',
    '0x000000000000000000000000650bb465e49767ea8c4553cf946b5b2358479a90',
    '0x000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'
  ],
  index: 1,
  transactionIndex: 0
}
[2025-03-28T02:40:51.775Z] INFO: Event data ingested into MongoDB.
```

## Metrics

Access metrics at: `http://localhost:3001/metrics`

```txt
# HELP blockchain_events_total Total number of blockchain events processed
# TYPE blockchain_events_total counter
blockchain_events_total{node="infura",contract="0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f",topic="PairCreated(address,address,address,uint256)"} 1
```