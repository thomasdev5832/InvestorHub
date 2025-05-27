package io.sevenseven.staking.aggregator.service.domain.pool

import io.sevenseven.staking.aggregator.service.domain.common.BaseEntity
import org.springframework.data.mongodb.core.index.Indexed
import org.springframework.data.mongodb.core.mapping.Document
import java.io.Serializable
import java.math.BigInteger

@Document("pools")
class Pools : BaseEntity() {
    @Indexed
    var address: String? = null

    @Indexed
    var pair: Pair? = null

    var amount: BigInteger? = null

    var fee: BigInteger? = null

    var tickSpacing: Int? = null
}

data class Pair(
    val token0: String,
    val token1: String
) : Serializable
