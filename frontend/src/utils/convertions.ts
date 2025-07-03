import { ethers } from 'ethers'

export function fromReadableAmount(
  amount: number,
  decimals: number
): bigint {
  return ethers.parseUnits(amount.toString(), decimals)
}

export function toReadableAmount(rawAmount: bigint | number, decimals: number): string {
  return ethers
    .formatUnits(rawAmount, decimals)
}