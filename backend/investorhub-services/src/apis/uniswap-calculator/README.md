# Uniswap V3 Calculator Service

This service provides comprehensive Uniswap V3 position calculations based on the [Uniswap V3 Math Primer](https://atiselsts.github.io/pdfs/uniswap-v3-liquidity-math.pdf). The service automatically fetches all necessary data from the blockchain using only the pool address, owner address, and network identifier.

## Features

- **Position Holdings**: Calculate current token amounts in a position
- **Uncollected Fees**: Calculate uncollected fees for a position
- **Liquidity Calculations**: Analyze liquidity distribution and amounts
- **Automatic Data Fetching**: No need to manually provide complex parameters
- **Multi-Network Support**: Supports different networks via network configuration

## Supported Networks

The service supports multiple networks through the `network` parameter:

- `eip155:11155111` - Sepolia Testnet
- `eip155:84532` - Base Sepolia Testnet

## API Endpoints

### 1. Position Holdings

Calculate current holdings in a Uniswap V3 position.

**Endpoint:** `POST /uniswap-calculator/position-holdings`

**Request Body:**
```json
{
  "poolAddress": "0x8ad599c3a0ff1de082011efddc58f1908eb6e6d8",
  "ownerAddress": "0x1234567890123456789012345678901234567890",
  "network": "eip155:11155111"
}
```

**Response:**
```json
{
  "poolAddress": "0x8ad599c3a0ff1de082011efddc58f1908eb6e6d8",
  "ownerAddress": "0x1234567890123456789012345678901234567890",
  "network": "eip155:11155111",
  "currentTick": 201838,
  "currentPrice": 1.0001,
  "positions": [
    {
      "tokenId": "123",
      "inRange": true,
      "token0Amount": "1000000000000000000",
      "token1Amount": "500000000000000000",
      "token0AmountHuman": 1.0,
      "token1AmountHuman": 0.5,
      "token0Symbol": "USDC",
      "token1Symbol": "ETH",
      "token0Decimals": 6,
      "token1Decimals": 18
    }
  ]
}
```

### 2. Uncollected Fees

Calculate uncollected fees for a position.

**Endpoint:** `POST /uniswap-calculator/uncollected-fees`

**Request Body:**
```json
{
  "poolAddress": "0x8ad599c3a0ff1de082011efddc58f1908eb6e6d8",
  "ownerAddress": "0x1234567890123456789012345678901234567890",
  "network": "eip155:11155111"
}
```

**Response:**
```json
{
  "poolAddress": "0x8ad599c3a0ff1de082011efddc58f1908eb6e6d8",
  "ownerAddress": "0x1234567890123456789012345678901234567890",
  "network": "eip155:11155111",
  "positions": [
    {
      "tokenId": "123",
      "token0Fees": "1000000",
      "token1Fees": "500000000000000000",
      "token0FeesHuman": 1.0,
      "token1FeesHuman": 0.5,
      "token0Symbol": "USDC",
      "token1Symbol": "ETH",
      "token0Decimals": 6,
      "token1Decimals": 18
    }
  ]
}
```

### 3. Liquidity Calculation

Analyze liquidity distribution for positions.

**Endpoint:** `POST /uniswap-calculator/liquidity-calculation`

**Request Body:**
```json
{
  "poolAddress": "0x8ad599c3a0ff1de082011efddc58f1908eb6e6d8",
  "ownerAddress": "0x1234567890123456789012345678901234567890",
  "network": "eip155:11155111"
}
```

**Response:**
```json
{
  "poolAddress": "0x8ad599c3a0ff1de082011efddc58f1908eb6e6d8",
  "ownerAddress": "0x1234567890123456789012345678901234567890",
  "network": "eip155:11155111",
  "currentTick": 201838,
  "currentPrice": 1.0001,
  "positions": [
    {
      "tokenId": "123",
      "liquidity": "1000000000000000000",
      "amount0": "1000000000000000000",
      "amount1": "500000000000000000",
      "amount0Human": 1.0,
      "amount1Human": 0.5,
      "token0Symbol": "USDC",
      "token1Symbol": "ETH",
      "token0Decimals": 6,
      "token1Decimals": 18
    }
  ]
}
```

## How It Works

The service automatically:

1. **Validates Network**: Checks if the provided network is supported
2. **Gets Network Config**: Retrieves provider URL and position manager address for the network
3. **Fetches Pool Data**: Gets current price, liquidity, and fee growth from the pool contract
4. **Finds User Positions**: Queries the position manager for all positions owned by the specified address
5. **Filters by Pool**: Only analyzes positions that belong to the specified pool
6. **Calculates Values**: Uses Uniswap V3 math formulas to calculate holdings, fees, and liquidity
7. **Returns Results**: Provides comprehensive analysis for each position

## Network Configuration

The service uses network configurations from `constants.ts`:

```typescript
export const NETWORKS_CONFIGS: Record<string, NetworkConfig> = {
    "eip155:11155111": {
        positionManagerAddress: "0xC36442b4a4522E871399CD717aBDD847Ab11FE88",
        providerUrl: "https://mainnet.infura.io/v3/YOUR_PROJECT_ID"
    },
    "eip155:84532": {
        positionManagerAddress: "0xC36442b4a4522E871399CD717aBDD847Ab11FE88",
        providerUrl: "https://mainnet.infura.io/v3/YOUR_PROJECT_ID"
    }
}
```

## Mathematical Background

### Position Holdings Calculation

The service calculates token amounts in a position using the formula:

```
if (currentTick >= tickLower && currentTick < tickUpper) {
  // Position is in range
  if (currentSqrtPrice <= sqrtPriceLower) {
    // All token0
    token0Amount = liquidity
    token1Amount = 0
  } else if (currentSqrtPrice >= sqrtPriceUpper) {
    // All token1
    token0Amount = 0
    token1Amount = liquidity
  } else {
    // Mixed position
    token0Amount = getAmount0ForLiquidity(sqrtPriceLower, sqrtPriceUpper, liquidity)
    token1Amount = getAmount1ForLiquidity(sqrtPriceLower, sqrtPriceUpper, liquidity)
  }
} else {
  // Position is out of range
  if (currentTick < tickLower) {
    // All token0
    token0Amount = liquidity
    token1Amount = 0
  } else {
    // All token1
    token0Amount = 0
    token1Amount = liquidity
  }
}
```

### Uncollected Fees Calculation

Fees are calculated using the fee growth mechanism:

```
feeGrowthInside = feeGrowthGlobal - feeGrowthBelow - feeGrowthAbove
uncollectedFees = liquidity * (feeGrowthInside - feeGrowthInsideLast) / 2^128
```

### Liquidity Calculation

Liquidity is calculated based on the current price relative to the position's range:

```
if (currentPrice <= priceLower) {
  liquidity = getLiquidityForAmount0(priceLower, priceUpper, amount0Desired)
} else if (currentPrice >= priceUpper) {
  liquidity = getLiquidityForAmount1(priceLower, priceUpper, amount1Desired)
} else {
  liquidity = min(
    getLiquidityForAmount0(currentPrice, priceUpper, amount0Desired),
    getLiquidityForAmount1(priceLower, currentPrice, amount1Desired)
  )
}
```

## Error Handling

The service handles various error scenarios:

- **Unsupported Network**: Returns error when network is not configured
- **No Positions Found**: Returns a message when no positions are found for the specified pool and owner
- **Invalid Pool Address**: Validates pool address format
- **Network Errors**: Handles RPC connection issues gracefully
- **Position Errors**: Continues processing even if individual positions fail to load

## Usage Examples

### JavaScript/TypeScript

```javascript
const response = await fetch('/uniswap-calculator/position-holdings', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    poolAddress: '0x8ad599c3a0ff1de082011efddc58f1908eb6e6d8',
    ownerAddress: '0x1234567890123456789012345678901234567890',
    network: 'eip155:11155111'
  })
});

const data = await response.json();
console.log('Position holdings:', data);
```

### cURL

```bash
curl -X POST http://localhost:3000/uniswap-calculator/position-holdings \
  -H "Content-Type: application/json" \
  -d '{
    "poolAddress": "0x8ad599c3a0ff1de082011efddc58f1908eb6e6d8",
    "ownerAddress": "0x1234567890123456789012345678901234567890",
    "network": "eip155:11155111"
  }'
```

## Swagger Documentation

The API includes comprehensive Swagger documentation with:

- **Detailed Descriptions**: Each endpoint has clear descriptions and examples
- **Request/Response Schemas**: Complete schema definitions for all DTOs
- **Error Responses**: Documented error scenarios and status codes
- **Examples**: Real-world examples for all endpoints

Access the Swagger documentation at: `http://localhost:3000/api`

## Dependencies

- **ethers.js**: For blockchain interaction
- **NestJS**: Framework for the API service
- **class-validator**: For request validation
- **@nestjs/swagger**: For API documentation

## Security Considerations

- All blockchain data is fetched from the specified RPC endpoint
- No private keys are required or stored
- Input validation ensures proper address formats
- Error handling prevents information leakage
- Network validation prevents unsupported network usage 