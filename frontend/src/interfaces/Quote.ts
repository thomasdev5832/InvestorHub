import { Token } from '@uniswap/sdk-core'

interface Quote {
  rpc: {
    sepolia: string
    base_sepolia: string
  }
  tokens: {
    in: Token
    amountIn: number
    out: Token
    poolFee: number
  }
}

export default Quote;