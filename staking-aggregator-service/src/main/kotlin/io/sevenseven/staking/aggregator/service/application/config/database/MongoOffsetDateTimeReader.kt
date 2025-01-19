package io.sevenseven.staking.aggregator.service.application.config.database

import org.bson.Document
import org.springframework.core.convert.converter.Converter
import java.time.OffsetDateTime
import java.time.ZoneOffset

class MongoOffsetDateTimeReader : Converter<Document, OffsetDateTime> {

    override fun convert(document: Document): OffsetDateTime? {
        val dateTime = document.getDate(MongoOffsetDateTimeWriter.DATE_FIELD)
        val offset = ZoneOffset.of(document.getString(MongoOffsetDateTimeWriter.OFFSET_FIELD))
        return OffsetDateTime.ofInstant(dateTime.toInstant(), offset)
    }

}
