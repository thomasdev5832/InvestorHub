package io.sevenseven.staking.aggregator.service.application.config

import org.springframework.aop.interceptor.AsyncUncaughtExceptionHandler
import org.springframework.aop.interceptor.SimpleAsyncUncaughtExceptionHandler
import org.springframework.boot.autoconfigure.task.TaskExecutionProperties
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.scheduling.annotation.AsyncConfigurer
import org.springframework.scheduling.annotation.EnableAsync
import org.springframework.scheduling.annotation.EnableScheduling
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor

@EnableAsync
@EnableScheduling
@Configuration
class AsyncConfig(private val taskExecutionProperties: TaskExecutionProperties) : AsyncConfigurer {
    @Bean(name = ["taskExecutor"])
    fun asyncExecutor(): ThreadPoolTaskExecutor =
        ThreadPoolTaskExecutor().apply {
            this.corePoolSize = taskExecutionProperties.pool.coreSize
            this.maxPoolSize = taskExecutionProperties.pool.maxSize
            this.queueCapacity = taskExecutionProperties.pool.queueCapacity
        }

    @Bean
    fun asyncUncaughtExceptionHandler(): AsyncUncaughtExceptionHandler = SimpleAsyncUncaughtExceptionHandler()
}
