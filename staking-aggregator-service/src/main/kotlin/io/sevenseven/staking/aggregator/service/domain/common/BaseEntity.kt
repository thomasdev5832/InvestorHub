package io.sevenseven.staking.aggregator.service.domain.common

import io.azam.ulidj.ULID
import jakarta.validation.constraints.NotNull
import org.springframework.data.annotation.CreatedDate
import org.springframework.data.annotation.Id
import org.springframework.data.annotation.LastModifiedDate
import org.springframework.data.annotation.Version
import java.time.OffsetDateTime

open class BaseEntity {
    @NotNull
    @Id
    var id: String? = null

    @CreatedDate
    var dateCreated: OffsetDateTime? = null

    @LastModifiedDate
    var lastUpdated: OffsetDateTime? = null

    @Version
    var version: Int? = null

    private fun isNew(): Boolean = id == null

    fun onBeforeSave() {
        if (isNew()) {
            id = ULID.random()
            dateCreated = OffsetDateTime.now()
            lastUpdated = dateCreated
        }
    }
}
