# Devfolio project questions

## The problem it solves

**InvestorHub** addresses the significant barriers faced by new cryptocurrency investors, particularly in navigating decentralized finance (DeFi) liquidity pools.

The key problems it solves:

- _Complex Terminology and Concepts_: Newcomers are often overwhelmed by crypto jargon (e.g., "gas fees," "impermanent loss") and intricate DeFi mechanisms, resulting in a high cognitive load. InvestorHub simplifies these through clear, jargon-free explanations, interactive tutorials, and a contextual glossary.
  Hidden Costs and Fees: Gas fees and other transaction costs are often unclear, deterring beginners. The platform provides transparent fee breakdowns, automated gas fee management, and reserves funds for withdrawals to ensure cost clarity.
- _Difficulty Accessing DeFi Opportunities_: Liquidity pools and other DeFi investments are intimidating due to their complexity. InvestorHub provides one-click access to curated, secure liquidity pools, offering clear risk and reward information.
- _Lack of Confidence and Education_: Beginners often fear scams, volatility, and losses due to a lack of experience. The platform builds confidence through gamified learning, earning IHUB tokens, and an investment simulator for risk-free practice.
- _Security and Trust Concerns_: Novice investors worry about platform security and reliability. InvestorHub ensures trust with robust security measures and a non-custodial model where users retain control of their funds.

## Challenges I ran into

This is the critical path of the project:

1. **Robust Blockchain Integration Testing and Monitoring**

- Chainlink CCIP Reliability: Test cross-chain transactions under high load and network congestion. Validate CCIPSendFacet and CCIPReceiveFacet for edge cases.
- Chainlink Automation Triggers: Ensure VaultAutomation.sol reliably triggers IHUB buybacks at USD thresholds. Simulate fee accumulation scenarios to verify uptime and accuracy.
- Smart Contract Security: Conduct multiple audits of Diamond proxy contracts to mitigate vulnerabilities.

2. **Security and Compliance Implementation**

- Smart Contract (pre) Audits: Prioritize audits for IHUB (post-MVP) and liquidity pool contracts, focusing on the modularity of the Diamond structure (DiamondCutFacet).
- Privy.io Integration: Ensure secure wallet authentication, especially for social logins.
- Web Security: Implement rate limiting, DDoS protection, and rigorous testing for XSS/CSRF vulnerabilities.

3. **Optimizing Investment Module UX and Reliability**

- One-Click Investment Flow: Streamline the investment process.
- Gas Fee Management: Develop dynamic fee adjustment mechanisms to handle spikes, ensuring reserved gas covers withdrawals.

4. **Scalable and Reliable Data Infrastructure**

- TheGraph and Redis Performance: Optimize TheGraph queries and Redis caching for improved performance.
- Daemon Service Stability: Ensure the Node.js daemon (querying TheGraph every 5 minutes) has robust error handling and monitoring for cache synchronization issues.

5. **Enhancing User Experience for Novices**

- Cognitive Load Reduction: Refine progressive disclosure and educational pop-ups to enhance user experience.
- Gamified Education: Prioritize basic educational modules for MVP.

## Tracks applied

### Cross-Chain Solutions

_How does this project fit within the track?_

Fit with Cross-Chain Solutions Track:

- _Chainlink CCIP as Core Enabler_: powers cross-chain investments with one-click transactions, addressing liquidity fragmentation.
- _User-Friendly Cross-Chain DeFi_: targets novices with a simplified UI, gamified education, and one-click investments, making cross-chain DeFi accessible and intuitive.
- Comprehensive Chainlink Integration: utilizes CCIP, Automation, Data Feeds (for price conversions), Functions (for off-chain payloads), and CCT (for token standardization) to create a robust cross-chain ecosystem.
- _Non-Custodial Security_: Model with Privy.io and audited smart contracts ensures secure cross-chain transfers.
- _Scalability and Market Fit_: aggregates opportunities across chains (Avalanche, Ethereum, Base Sepolia), targeting a $15B DeFi market.

### Avalanche Track

_How does this project fit within the track?_

Fit with Cross-Chain Solutions Track (Avalanche Context)

- _Avalanche as Cross-Chain Hub for low-cost, high-speed transactions_ : enabling cross-chain investments (e.g., wBTC on Avalanche to LINK/USDT on Ethereum) via Chainlink CCIP.
- _User-Friendly DeFi on Avalanche_ : simplifies Avalanche-based DeFi for novices with one-click investments and gamified education.
- _Chainlink Tools on Avalanche_ : integrates CCIP (cross-chain transfers), Automation (IHUB buybacks), Data Feeds (price conversions), and Functions (off-chain payloads) on Avalanche.
- _Non-Custodial Security model with Privy.io_ : audited smart contracts on Avalanche ensures secure cross-chain operations.
- _Liquidity Fragmentation Solution_ : aggregates cross-chain pools from Avalanche, turning fragmentation into opportunity.

## Technologies used

- Solidity
- MongoDB
- Chainlink

## Platforms

- [x] web
