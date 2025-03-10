package io.sevenseven.staking.aggregator.service.resource.blockchain.uniswap

import com.fasterxml.jackson.databind.ObjectMapper
import io.reactivex.Flowable
import io.sevenseven.staking.aggregator.service.application.config.BlockchainNodeConfig
import jakarta.annotation.PostConstruct
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.scheduling.annotation.Async
import org.springframework.stereotype.Component
import org.web3j.protocol.Web3j
import org.web3j.protocol.core.DefaultBlockParameterName
import org.web3j.protocol.core.methods.request.EthFilter
import org.web3j.protocol.core.methods.response.Log

// https://github.com/alainncls/web3j-spring-boot-example/blob/main/src/main/java/com/consensys/web3j/Web3jApplication.java
@Component
class EthLogFlowableListener(
    private val blockchainNodeConfig: BlockchainNodeConfig,
    private val objectMapper: ObjectMapper
) {
    private val logger: Logger = LoggerFactory.getLogger(EthLogFlowableListener::class.java)

    @PostConstruct
    fun init() {
        logger.info("Starting EthLogFlowableListener...")

        startListenToEvents()
    }

    private fun startListenToEvents() {
        blockchainNodeConfig.nodes.forEach {
            startClient(
                client = it.web3j(),
                contracts = it.pools
            )
        }
    }

    @Async
    private fun startClient(client: Web3j, contracts: List<String>) =
        client.let {
            contracts.forEach { contractAddress ->
                Contract(
                    client = it,
                    contractAddress = contractAddress,
                    mapper = objectMapper
                ).let { contract ->
                    subscribeToEvents(contract)
                }
            }
        }

    @Async
    private fun subscribeToEvents(contract: Contract) =
        contract.eventFlowable().subscribe { event ->
            logger.info("Listening to events [{}]", event)
        }
}

class Contract(
    private val client: Web3j,
    private val contractAddress: String,
    private val mapper: ObjectMapper
) {
    private val logger: Logger = LoggerFactory.getLogger(Contract::class.java)

    @Async
    fun eventFlowable(): Flowable<Unit> = EthFilter(
        DefaultBlockParameterName.LATEST,
        DefaultBlockParameterName.LATEST,
        contractAddress
    ).let {
        client.ethLogFlowable(it).map { log -> processEvent(log) }
    }

    private fun processEvent(log: Log) {
        logger.info(
            "Event received -> LogIndex = {}, TxHash = {}",
            log.logIndex,
            log.transactionHash
        )

        mapper.writerWithDefaultPrettyPrinter().writeValueAsString(log).let {
            logger.info(it)
        }
    }
}
