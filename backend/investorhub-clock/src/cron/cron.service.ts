import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { TokenPairsService } from '../token-pairs/token-pairs.service';
import { PoolService } from '../subgraph/pools/pool.service';
import { PoolStorageService } from '../pools-storage/pool-storage.service';

@Injectable()
export class CronService implements OnModuleInit {
  private readonly logger = new Logger(CronService.name);
  
  constructor(
    private readonly tokenPairsService: TokenPairsService,
    private readonly poolService: PoolService,
    private readonly poolStorageService: PoolStorageService,
  ) {}

  async onModuleInit() {
    try {
      this.logger.log('Starting token pairs generation...');
      const networkTokenPairs = await this.tokenPairsService.generateTokenPairs();
      
      // Process each network's token pairs
      for (const { network, pairs } of networkTokenPairs) {
        this.logger.log(`Processing ${pairs.length} token pairs for network ${network.name}`);
        
        // Process each pair in the network
        for (const pair of pairs) {
          try {
            this.logger.debug(`Fetching pools for token pair: ${pair.token0.symbol}-${pair.token1.symbol}`);
            
            if (!network.graphqlUrl) {
              this.logger.warn(`No subgraph URL configured for network ${network.name}, skipping...`);
              continue;
            }
            
            const pools = await this.poolService.fetchPoolsForTokenPair(
              pair.token0.address,
              pair.token1.address,
              network,
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