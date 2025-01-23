package io.sevenseven.staking.aggregator.service.domain.pool

import io.sevenseven.staking.aggregator.service.domain.common.BaseEntity
import jakarta.validation.constraints.Size
import org.springframework.data.mongodb.core.index.Indexed
import org.springframework.data.mongodb.core.mapping.Document

@Document("pools")
class Pools : BaseEntity() {

    @Indexed(unique = true)
    @Size(max = 255)
    var address: String? = null
}
