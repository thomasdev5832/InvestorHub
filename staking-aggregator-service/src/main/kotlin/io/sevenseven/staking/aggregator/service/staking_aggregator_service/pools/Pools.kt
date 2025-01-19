package io.sevenseven.staking.aggregator.service.staking_aggregator_service.pools

import jakarta.validation.constraints.NotNull
import jakarta.validation.constraints.Size
import java.time.OffsetDateTime
import org.springframework.data.annotation.CreatedDate
import org.springframework.data.annotation.Id
import org.springframework.data.annotation.LastModifiedDate
import org.springframework.data.annotation.Version
import org.springframework.data.mongodb.core.mapping.Document


@Document("poolses")
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
