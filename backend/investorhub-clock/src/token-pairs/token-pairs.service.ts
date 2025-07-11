import { Injectable, Logger } from '@nestjs/common';
import { Token } from '../database/schemas/token.schema';
import { NetworkConfig } from '../database/schemas/network-config.schema';
import { TokenRepository } from '../database/repositories/token.repository';
import { NetworkConfigRepository } from '../database/repositories/network-config.repository';
import { ObjectId } from 'mongoose';

interface TokenPair {
  token0: Token;
  token1: Token;
}

interface NetworkTokenPairs {
  network: NetworkConfig;
  pairs: TokenPair[];
}

interface SubgraphToken {
  id: string;
  symbol: string;
  decimals: number;
}

@Injectable()
export class TokenPairsService {
  private readonly logger = new Logger(TokenPairsService.name);

  constructor(
    private readonly tokenRepository: TokenRepository,
    private readonly networkConfigRepository: NetworkConfigRepository,
  ) {}

  async updateTokenDecimals(token: SubgraphToken, network: NetworkConfig): Promise<void> {
    try {
      const existingToken = await this.tokenRepository.findByAddress(token.id);
      if (existingToken && existingToken.decimals !== token.decimals) {
        this.logger.debug(`Updating decimals for token ${token.symbol} from ${existingToken.decimals} to ${token.decimals}`);
        await this.tokenRepository.update(existingToken.id, { decimals: token.decimals });
      }
    } catch (error) {
      this.logger.error(`Error updating decimals for token ${token.symbol}: ${error.message}`);
    }
  }

  async generateTokenPairs(): Promise<NetworkTokenPairs[]> {
    try {
      // Get all networks
      const networks = await this.networkConfigRepository.findAll();
      const result: NetworkTokenPairs[] = [];

      // For each network, get its tokens and generate pairs
      for (const network of networks) {
        
        this.logger.debug(`Processing network: ${network.name} with ID: ${network._id}`);
        
        const tokens = await this.tokenRepository.findByNetworkId(network._id as ObjectId);
        
        // Filter only whitelisted tokens
        const whitelistedTokens = tokens.filter(token => token.whitelist === true);
        
        this.logger.debug(`Found ${tokens.length} tokens for network ${network.name}, ${whitelistedTokens.length} are whitelisted`);
        
        // Generate all possible pairs for this network's whitelisted tokens
        const pairs = this.generatePairs(whitelistedTokens);
        
        result.push({
          network,
          pairs,
        });

        this.logger.log(`Generated ${pairs.length} pairs for network ${network.name}`);
      }

      return result;
    } catch (error) {
      this.logger.error(`Error generating token pairs: ${error.message}`, error.stack);
      throw error;
    }
  }

  private generatePairs(tokens: Token[]): TokenPair[] {
    const pairs: TokenPair[] = [];

    // Generate all possible combinations of tokens
    for (let i = 0; i < tokens.length; i++) {
      for (let j = i + 1; j < tokens.length; j++) {
        // Sort tokens by address to ensure consistent ordering
        const [token0, token1] = [tokens[i], tokens[j]].sort((a, b) => 
          a.address.toLowerCase().localeCompare(b.address.toLowerCase())
        );

        pairs.push({ token0, token1 });
      }
    }

    return pairs;
  }
} 