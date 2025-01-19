package io.sevenseven.staking.aggregator.service.application.config.database

import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.data.auditing.DateTimeProvider
import org.springframework.data.mongodb.MongoDatabaseFactory
import org.springframework.data.mongodb.MongoTransactionManager
import org.springframework.data.mongodb.config.EnableMongoAuditing
import org.springframework.data.mongodb.core.convert.MongoCustomConversions
import org.springframework.data.mongodb.core.mapping.event.ValidatingMongoEventListener
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories
import org.springframework.validation.beanvalidation.LocalValidatorFactoryBean
import java.time.OffsetDateTime
import java.util.*


@Configuration
@EnableMongoRepositories("io.sevenseven.staking.aggregator.service")
@EnableMongoAuditing(dateTimeProviderRef = "auditingDateTimeProvider")
class MongoConfig {

    @Bean
    fun transactionManager(databaseFactory: MongoDatabaseFactory): MongoTransactionManager =
        MongoTransactionManager(databaseFactory)

    @Bean(name = ["auditingDateTimeProvider"])
    fun dateTimeProvider(): DateTimeProvider =
        DateTimeProvider { Optional.of(OffsetDateTime.now()) }

    @Bean
    fun validatingMongoEventListener(factory: LocalValidatorFactoryBean):
            ValidatingMongoEventListener = ValidatingMongoEventListener(factory)

    @Bean
    fun mongoCustomConversions(): MongoCustomConversions = MongoCustomConversions(
        listOf(
            MongoOffsetDateTimeWriter(),
            MongoOffsetDateTimeReader()
        )
    )
}
