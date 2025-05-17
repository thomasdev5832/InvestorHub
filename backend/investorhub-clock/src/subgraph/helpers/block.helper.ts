import { ethers } from 'ethers';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class BlockHelper {
  private readonly logger = new Logger(BlockHelper.name);

  /**
   * Get the current block number for a specific network
   * @param rpcUrl The RPC URL of the network
   * @returns Promise<number> The current block number
   */
  async getCurrentBlockNumber(rpcUrl: string): Promise<number> {
    try {
      const provider = new ethers.JsonRpcProvider(rpcUrl);
      const blockNumber = await provider.getBlockNumber();
      return blockNumber;
    } catch (error) {
      this.logger.error(`Failed to get current block number for network ${rpcUrl}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get the timestamp of a specific block
   * @param blockNumber The block number to get the timestamp for
   * @param rpcUrl The RPC URL of the network
   * @returns Promise<number> The block timestamp
   */
  async getBlockTimestamp(blockNumber: number, rpcUrl: string): Promise<number> {
    try {
      const provider = new ethers.JsonRpcProvider(rpcUrl);
      const block = await provider.getBlock(blockNumber);
      if (!block) {
        throw new Error(`Block ${blockNumber} not found`);
      }
      return block.timestamp;
    } catch (error) {
      this.logger.error(`Failed to get block timestamp for block ${blockNumber}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get the current block timestamp for a specific network
   * @param rpcUrl The RPC URL of the network
   * @returns Promise<number> The current block timestamp
   */
  async getCurrentBlockTimestamp(rpcUrl: string): Promise<number> {
    try {
      const blockNumber = await this.getCurrentBlockNumber(rpcUrl);
      return this.getBlockTimestamp(blockNumber, rpcUrl);
    } catch (error) {
      this.logger.error(`Failed to get current block timestamp for network ${rpcUrl}: ${error.message}`);
      throw error;
    }
  }
} 