package io.sevenseven.staking.aggregator.service.resource

import io.sevenseven.staking.aggregator.service.domain.pool.Pools
import org.springframework.data.mongodb.repository.MongoRepository


interface PoolsRepository : MongoRepository<Pools, String>
