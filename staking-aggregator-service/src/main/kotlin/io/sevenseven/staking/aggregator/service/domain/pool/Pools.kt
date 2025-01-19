package io.sevenseven.staking.aggregator.service.domain.pool

import jakarta.validation.constraints.NotNull
import jakarta.validation.constraints.Size
import org.springframework.data.annotation.CreatedDate
import org.springframework.data.annotation.Id
import org.springframework.data.annotation.LastModifiedDate
import org.springframework.data.annotation.Version
import org.springframework.data.mongodb.core.mapping.Document
import java.time.OffsetDateTime

@Document("pools")
class Pools {

    @NotNull
    @Id
    var id: String? = null

    @Size(max = 255)
    var address: String? = null

    @CreatedDate
    var dateCreated: OffsetDateTime? = null

    @LastModifiedDate
    var lastUpdated: OffsetDateTime? = null

    @Version
    var version: Int? = null
}
