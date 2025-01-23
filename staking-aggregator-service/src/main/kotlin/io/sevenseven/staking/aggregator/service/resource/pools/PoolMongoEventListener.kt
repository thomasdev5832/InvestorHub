package io.sevenseven.staking.aggregator.service.resource.pools

import io.sevenseven.staking.aggregator.service.domain.pool.Pools
import org.springframework.data.mongodb.core.mapping.event.AbstractMongoEventListener
import org.springframework.data.mongodb.core.mapping.event.BeforeConvertEvent
import org.springframework.stereotype.Component

@Component
class PoolsMongoEventListener : AbstractMongoEventListener<Pools>() {

    override fun onBeforeConvert(event: BeforeConvertEvent<Pools>) {
        event.source.onBeforeSave()
    }
}
