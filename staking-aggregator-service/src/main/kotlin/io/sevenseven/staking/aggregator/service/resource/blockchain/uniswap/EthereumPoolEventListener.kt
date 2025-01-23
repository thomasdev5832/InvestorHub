package io.sevenseven.staking.aggregator.service.resource.blockchain.uniswap

import com.fasterxml.jackson.databind.ObjectMapper
import io.reactivex.Flowable
import io.reactivex.disposables.Disposable
import jakarta.annotation.PostConstruct
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Qualifier
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.scheduling.annotation.Async
import org.springframework.stereotype.Component
import org.web3j.protocol.Web3j
import org.web3j.protocol.core.DefaultBlockParameterName
import org.web3j.protocol.core.methods.request.EthFilter
import org.web3j.protocol.core.methods.response.Log
import org.web3j.protocol.http.HttpService

@Component
class EthereumPoolEventListener(
    @Value("\${app.blockchain.pool.contract.address}") private val contractAddress: String,
    @Qualifier("infuraBlockchainWebClient") private val web3j: Web3j,
    private val objectMapper: ObjectMapper
) {
    private val logger: Logger = LoggerFactory.getLogger(EthereumPoolEventListener::class.java)

    @PostConstruct
    fun init() {
        logger.info(
            "Starting EthereumPoolEventListener for contract address -> {} and client -> {}",
            contractAddress,
            web3j
        )

        listenToEvents()
    }

    fun listenToEvents(): Disposable =
        PoolContract(contractAddress).eventFlowable(web3j).subscribe { event ->
            objectMapper.writeValueAsString(event).let {
                logger.info("Log received -> {}", event)
            }
        }
}

@Configuration
class InfuraBlockchainWebClientConfig(
    @Value("\${app.blockchain.node.infura.url}") private val url: String,
    @Value("\${app.blockchain.node.infura.apiKey}") private val apiKey: String,
) {

    @Bean
    @Qualifier("infuraBlockchainWebClient")
    fun infuraBlockchainWebClient(): Web3j = Web3j.build(HttpService("$url/$apiKey"))
}

class PoolContract(private val contractAddress: String) {
    private val logger: Logger = LoggerFactory.getLogger(PoolContract::class.java)

    @Async
    fun eventFlowable(web3j: Web3j): Flowable<Log> = EthFilter(
        DefaultBlockParameterName.SAFE,
        DefaultBlockParameterName.LATEST,
        contractAddress
    ).let {
        web3j.ethLogFlowable(it).map { log -> processEvent(log) }
    }

    private fun processEvent(log: Log): Log {
        logger.info(
            "Event received -> LogIndex = {}, TxHash = {}",
            log.logIndex,
            log.transactionHash
        )
        return log
    }
}
