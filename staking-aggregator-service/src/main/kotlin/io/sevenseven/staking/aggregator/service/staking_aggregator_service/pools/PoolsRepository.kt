package io.sevenseven.staking.aggregator.service.staking_aggregator_service.pools

import org.springframework.data.mongodb.repository.MongoRepository


interface PoolsRepository : MongoRepository<Pools, String>
