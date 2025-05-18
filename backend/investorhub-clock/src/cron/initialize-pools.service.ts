import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { TokenPairsService } from '../token-pairs/token-pairs.service';
import { PoolService } from '../subgraph/pools/pool.service';
import { PoolStorageService } from '../pools-storage/pool-storage.service';
import { SubgraphBlockHelper } from '../subgraph/helpers/subgraph-block.helper';
import { NetworkConfig } from '../database/schemas/network-config.schema';

interface NetworkWithBlock {
  network: NetworkConfig;
  blockNumber: number;
}

@Injectable()
export class InitializePoolsService implements OnModuleInit {
  private readonly BLOCK_OFFSET = 5;
  private readonly logger = new Logger(InitializePoolsService.name);
  
  constructor(
    private readonly tokenPairsService: TokenPairsService,
    private readonly poolService: PoolService,
    private readonly poolStorageService: PoolStorageService,
    private readonly subgraphBlockHelper: SubgraphBlockHelper,
  ) {}

  private async getNetworkBlocks(networks: NetworkConfig[]): Promise<NetworkWithBlock[]> {
    const networksWithBlocks: NetworkWithBlock[] = [];

    for (const network of networks) {
      if (!network.graphqlUrl) {
        this.logger.warn(`No subgraph URL configured for network ${network.name}, skipping...`);
        continue;
      }

      try {
        const block = await this.subgraphBlockHelper.getCurrentBlock(network.graphqlUrl);
        this.logger.debug(`Got block ${block.number} for network ${network.name}`);
        networksWithBlocks.push({
          network,
          blockNumber: block.number,
        });
      } catch (error) {
        this.logger.error(`Failed to get block for network ${network.name}: ${error.message}`);
      }
    }

    return networksWithBlocks;
  }

  async onModuleInit() {
    try {
      this.logger.log('Starting token pairs generation...');
      const networkTokenPairs = await this.tokenPairsService.generateTokenPairs();
      
      // Get unique networks from the pairs
      const uniqueNetworks = Array.from(new Set(networkTokenPairs.map(ntp => ntp.network)));
      
      // Get blocks for all networks first
      this.logger.log('Fetching blocks for all networks...');
      const networksWithBlocks = await this.getNetworkBlocks(uniqueNetworks);
      
      if (networksWithBlocks.length === 0) {
        this.logger.error('No networks with valid blocks found');
        return;
      }

      // Process each network's token pairs using the pre-fetched blocks
      for (const { network, pairs } of networkTokenPairs) {
        const networkWithBlock = networksWithBlocks.find(nwb => nwb.network.id === network.id);
        
        if (!networkWithBlock) {
          this.logger.warn(`No block found for network ${network.name}, skipping pairs...`);
          continue;
        }

        this.logger.log(`Processing ${pairs.length} token pairs for network ${network.name} at block ${networkWithBlock.blockNumber}`);
        
        // Process each pair in the network
        for (const pair of pairs) {
          try {
            this.logger.debug(`Fetching pools for token pair: ${pair.token0.symbol}-${pair.token1.symbol}`);
            
            const pools = await this.poolService.fetchPoolsForTokenPair(
              pair.token0.address,
              pair.token1.address,
              network,
              networkWithBlock.blockNumber-this.BLOCK_OFFSET, //This is to avoid the block wasn´t been processed yet on the subgraph
            );
            
            this.logger.debug(
              `Found ${pools.pools.length} pools for ${pair.token0.symbol}-${pair.token1.symbol} at block ${pools.blockNumber}`,
            );

            // Save pools to database
            await this.poolStorageService.savePools(
              pools,
              pair.token0.id.toString(),
              pair.token1.id.toString(),
            );
          } catch (error) {
            this.logger.error(
              `Error fetching pools for pair ${pair.token0.symbol}-${pair.token1.symbol}: ${error.message}`,
              error.stack,
            );
            // Continue with next pair even if this one fails
            continue;
          }
        }
      }
      
      this.logger.log('Token pairs processing completed successfully');
    } catch (error) {
      this.logger.error(`Error in token pairs processing: ${error.message}`, error.stack);
    }
  }
} 