package io.sevenseven.staking.aggregator.service.application.config.database

import org.bson.Document
import org.springframework.core.convert.converter.Converter
import java.time.OffsetDateTime
import java.util.*

class MongoOffsetDateTimeWriter : Converter<OffsetDateTime, Document> {

    override fun convert(offsetDateTime: OffsetDateTime): Document {
        val document = Document()
        document[DATE_FIELD] = Date.from(offsetDateTime.toInstant())
        document[OFFSET_FIELD] = offsetDateTime.offset.toString()
        return document
    }

    companion object {
        const val DATE_FIELD = "dateTime"
        const val OFFSET_FIELD = "offset"
    }
}
