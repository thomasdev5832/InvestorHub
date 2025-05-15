package io.sevenseven.staking.aggregator.service.application.config

import org.springframework.boot.context.properties.ConfigurationProperties
import org.springframework.boot.context.properties.EnableConfigurationProperties
import org.springframework.context.annotation.Configuration
import org.web3j.protocol.Web3j
import org.web3j.protocol.http.HttpService
import java.io.Serializable

@Configuration
@EnableConfigurationProperties(
    value = [
        BlockchainNodeConfig::class
    ]
)
class BlockchainPropertiesConfig

@ConfigurationProperties(prefix = "app.blockchain")
data class BlockchainNodeConfig(
    val nodes: List<NodeConfig>,
) : Serializable

data class NodeConfig(
    val url: String,
    val apiKey: String,
    val pools: List<PoolConfig>,
) : Serializable {
    fun web3j(): Web3j = Web3j.build(HttpService("$url/$apiKey"))
}

data class PoolConfig(
    val address: String,
    val topics: List<String>
) : Serializable
