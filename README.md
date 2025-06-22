# <p align="center"> InvestorHub

</p>

<p align="center"> Chainlink Chromion Hackathon
</p>
</br>

### Links
- Pitch deck presentation is available on [YouTube]()
- Live demo [website]()
- [Slide]() presentation

</br>

### Summary

1. [Introduction]()

   1.1.

   1.2.

   1.3.
   
   1.4.
   
2. [InvestorHub Protocol]()

   2.1. The MVP
   
3. [Tools Used]()

   3.1. Chainlink Automation - Reliable, High-Performance, Decentralized Automation for Smart Contracts

   3.2. Chainlink CCIP - Global Standard for Building Secure Cross-chain Applications

   3.3. Chainlink CCT - CCIP's Feature Enabling Secure and Reliable Cross-chain Token Transfers.

   3.4. Chainlink Data Feeds - Decentralized and High-Quality Data for DeFi, and more.

   3.5. Chainlink Functions - Serverless Platform that Fetches Data from Any API & Runs Custom Compute.
   
   3.6. [Chainlink Tools Summary Table]()

   3.6. API - Application Programming Interface

4. [Operation]()

   4.1.

   4.2.

   4.3.

   4.4.

   4.4.1.

   4.4.2.

   4.5.

   4.5.1.

   4.5.2.

   4.6.

   4.6.1.

   4.6.2.

   4.7.

   4.8.

   4.8.1.
   4.8.2. 

   4.8.3.

   4.8.4. 

5. [Cost Projection]()

   5.1. 

   5.2. 

   5.3. 

   5.4. 

   5.5. 

   5.6. 

   5.7. 

   5.8. 

   5.9. 

6. [Protocol Evolution]()

   6.1. 

   6.2. 

   6.3. 

   6.4. 

   6.5. 

7. [Conclusion]()
   
8. [Developer Session]()

   8.1. Smart contracts

   8.2. Blockchains

   8.3. Tools

   8.4. API
    
</br>

---

</br>

## 1. Introduction

Description

</br>

### 1.1. What is _InvestorHub_?

Description

</br>

### 1.2. Why is it relevant?

Description

<br/>

### 1.3. How does _InvestorHub_ works?

Description

</br>

### 1.4. _InvestorHub_ Advantages

- Bullet Points

</br>

## 2. InvestorHub Protocol

InvestorHub is a DEFI protocol aimed at simplifying access to the Web3 ecosystem, [...]

</br>

</br>

### 2.1. The MVP

This MVP simulates the following stages:

</br>

- [x] Bullet points

</br>

## 3. Tools Used

</br>

### 3.1. Chainlink Automation - Chainlink’s hyper-reliable Automation network

How it is used

</br>

### 3.2. Chainlink CCIP - Cross-Chain Interoperability Protocol

Chainlink CCIP allows Horizon to offer inclusion to diverse peoples and cultures by enabling communication between various blockchains and allowing the integration and use of assets from different parts of the globe in a secure and decentralized manner. Specifically, Horizon, will enable the creation of allocation permissions for guarantees on all Ethereum-compatible networks and, in the future, may integrate the protocol with specific networks of each country.

</br>

### 3.4. Chainlink CCT

How is it used?

</br>

### 3.4. Data Feeds

How is it used?

</br>

### 3.3. Chainlink Functions

Chainlink Functions will carry out the collection of necessary data for the allocation of Assets according to their respective off-chain databases. Furthermore, it could assist in the future with the implementation of liquidation measures or alerts to the respective owners of the assets allocated in the protocol.

It is responsible for collecting data through the FIPE API, bringing on-chain data of automobiles that will be used as examples of tokenized assets for guarantees.

</br>

### 3.5. Chainlink Tools Summary Table

Select the solution link and get redirected to the code.

</br>

#### Chainlink CCIP
|    Contract    |   Line   |       Function         |   Go to  |
|----------------|----------|------------------------|----------|
|CCIPSendFacet   |   123    | _ccipsend.             | [Check](https://github.com/77InnovationLabs/InvestorHub/blob/07fad602654121354cf058f8fd5674f76a3a4d74/on-chain/src/facets/Chainlink/CCIPSendFacet.sol#L123-L193)|
|CCIPReceiverFacet|   86    | _ccipReceive           | [Check](https://github.com/77InnovationLabs/InvestorHub/blob/07fad602654121354cf058f8fd5674f76a3a4d74/on-chain/src/facets/Chainlink/CCIPReceiveFacet.sol#L86-L148)|


</br>

#### Chainlink Data Feeds
|    Contract    |   Line   | Function               |   Go to  |
|----------------|----------|------------------------|----------|
| DataFeedsFacet |    59    |   getUSDValueOfLink    | [Check](https://github.com/77InnovationLabs/InvestorHub/blob/07fad602654121354cf058f8fd5674f76a3a4d74/on-chain/src/facets/Chainlink/DataFeedsFacet.sol#L59-L73)|

</br>

#### Chainlink Functions
|    Contract    |   Line   |        Function        |   Go to  |
|----------------|----------|------------------------|----------|
|VaultAutomation |    59    |      performUpkeep     | [Check](https://github.com/77InnovationLabs/InvestorHub/blob/07fad602654121354cf058f8fd5674f76a3a4d74/on-chain/src/vault/VaultAutomation.sol#L123)|
| IHUBFunctions  |    68    |       sendRequest      | [Check](https://github.com/77InnovationLabs/InvestorHub/blob/07fad602654121354cf058f8fd5674f76a3a4d74/on-chain/src/vault/IHUBFunctions.sol#L68-L92)|


</br>

#### Chainlink Automation
|     Contract   |   Line   |        Function        |   Go to  |
|----------------|----------|------------------------|----------|
|VaultAutomation |    94    |      checkUpkeep       | [Check](https://github.com/77InnovationLabs/InvestorHub/blob/07fad602654121354cf058f8fd5674f76a3a4d74/on-chain/src/vault/VaultAutomation.sol#L94-L105)|
|VaultAutomation |   114    |     performUpkeep      | [Check](https://github.com/77InnovationLabs/InvestorHub/blob/07fad602654121354cf058f8fd5674f76a3a4d74/on-chain/src/vault/VaultAutomation.sol#L114-L124)


</br>

### 3.6. API - Application Programming Interface

Description

</br>

## 4. Operation

Description

</br>

### 4.1. Subtitle

Description

### 4.3. Withdrawal Conditions

Description

### 4.4. Subtitle+

Description

</br>

### 4.4.1. Subtitle

Description

</br>

### 4.4.2. Subtitle

Description

</br>

### 4.5. Subtitle

Description

</br>

### 4.5.1. Withdrawal Process

bullet points
  
<br/>

</br>

### 4.5.2. Flexibility and Security

Example
This withdrawal system has been designed to offer flexibility to users while maintaining the security and integrity of the protocol.

</br>

### 4.6. Positions Management and Cross-Chain Investments

### 4.6.1. Subtitle

bullet points

### 4.6.2. Subtitle

bullet points

</br>

### 4.7. Subtitle

bullet points

</br>

## 5. Cost Projection

Text

</br>

### 5.1. Goal

bullet points

### 5.8. Conclusion

bullet points

</br>

### 5.9. Research References

bullet points

</br>

## 6. Evolution of the Protocol

Example:
Given the structure presented, the protocol has vast potential for growth and evolution. Among the points that have been discussed, we have:

</br>

### 6.1. Subtitle

bullet points

</br>

### 6.2. Subtitle

bullet points

</br>

### 6.3. Subtitle

bullet points

</br>

### 6.4. Subtitle

bullet points

</br>

### 6.5. SubTitle

bullet points

</br>

### 6.6. Our Thoughts

Example Content
All the potential scenarios presented converge to efficient and transparent processes through the employed technology and generate financial inclusion for individuals and businesses that lack access to loans from traditional institutions but have assets and need to create value from them.

In summary, the initial product and its possible developments are not only useful for investors but also for people who, in times of need, can meet specific demands such as health issues by acquiring loans and financing quickly and conveniently using their assets as collateral.

</br>

## 7. Conclusion

Text

<br/>

</br>

## 8. Developer Session

### 8.1. Smart contracts

#### 8.1.1 Diamond Structure

- [Diamond](https://github.com/77InnovationLabs/InvestorHub/blob/main/on-chain/src/Diamond.sol);

- [DiamondCutFacet](https://github.com/77InnovationLabs/InvestorHub/blob/main/on-chain/src/diamond/DiamondCutFacet.sol);

- [DiamondLoupeFacet](https://github.com/77InnovationLabs/InvestorHub/blob/main/on-chain/src/diamond/DiamondLoupeFacet.sol);

- [OwnershipFacet](https://github.com/77InnovationLabs/InvestorHub/blob/main/on-chain/src/diamond/OwnershipFacet.sol);

- [DiamondInitializer](https://github.com/77InnovationLabs/InvestorHub/blob/main/on-chain/src/upgradeInitializers/DiamondInitializer.sol).

#### 8.1.2 Diamond Business Logic - Swap Facets

- [StartSwap](https://github.com/77InnovationLabs/InvestorHub/blob/main/on-chain/src/facets/dex/UniswapV3/StartSwapFacet.sol);

- [StartFullSwap](https://github.com/77InnovationLabs/InvestorHub/blob/main/on-chain/src/facets/dex/UniswapV3/StartFullSwapFacet.sol).

#### 8.1.3 Diamond Business Logic - Investment Facets

- [StartUniswapV3Position](https://github.com/77InnovationLabs/InvestorHub/blob/main/on-chain/src/facets/stake/UniswapV3/StartUniswapV3PositionFacet.sol);

- [DecreaseLiquidity](https://github.com/77InnovationLabs/InvestorHub/blob/main/on-chain/src/facets/stake/UniswapV3/DecreaseLiquidityFacet.sol);

- [Collect](https://github.com/77InnovationLabs/InvestorHub/blob/main/on-chain/src/facets/stake/UniswapV3/CollectFeesFacet.sol);

- [IncreaseLiquidity](https://github.com/77InnovationLabs/InvestorHub/blob/main/on-chain/src/facets/stake/UniswapV3/IncreaseLiquidityFacet.sol).

#### 8.1.4 Diamond Business Logic - Chainlink Facets

- [CCIPSend](https://github.com/77InnovationLabs/InvestorHub/blob/main/on-chain/src/facets/Chainlink/CCIPSendFacet.sol);

- [CCIPReceive](https://github.com/77InnovationLabs/InvestorHub/blob/main/on-chain/src/facets/Chainlink/CCIPReceiveFacet.sol);

- [DataFeeds](https://github.com/77InnovationLabs/InvestorHub/blob/main/on-chain/src/facets/Chainlink/DataFeedsFacet.sol).

#### 8.1.5 Vault

- [AutomatedVault](https://github.com/77InnovationLabs/InvestorHub/blob/main/on-chain/src/vault/VaultAutomation.sol).

</br>

### 8.2. Blockchains

- [Avalanche](https://www.avax.network)

- [Base Sepolia](https://www.base.org/)

- [Ethereum Sepolia](https://ethereum.org/pt-br/)

</br>

### 8.3. Tools

| Technology |    Type    |    Usage   |
|------------|------------|------------|
| [Chainlink Automation](https://docs.chain.link/chainlink-automation) |   Oracle   |    Automate Fees Conversion into InvestorHub Tokens       |
|    [Chainlink CCIP](https://docs.chain.link/ccip)    |   Oracle   |    Enable Seamless and Secure Cross-chain Investment        |
|    [Chainlink CCT](https://docs.chain.link/ccip/concepts/cross-chain-token)     |   Oracle   |    Standardize the Protocol's Token to Enable Cross-Chain Service Provision        |
| [Chainlink Data Feeds](https://docs.chain.link/data-feeds) |   Oracle   |    Enable LINK conversion into USD         |
| [Chainlink Functions](https://docs.chain.link/chainlink-functions)  |   Oracle   |    Monitor Protocol Status and Generate Swap Payloads for Fee's Token -> IHUB Token        |
|   [Foundry](https://getfoundry.sh/)  | Framework  |    Development, Testing and Scripting        |
| [JavaScript](https://developer.mozilla.org/pt-BR/docs/Web/JavaScript) | P. Language|    Execute Chainlink Functions Off-chain Compute        |
|  |            |            |
|  |            |            |


</br>

### 8.4. API

  