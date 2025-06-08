import { Injectable, Logger } from '@nestjs/common';
import { GraphQLClient } from 'graphql-request';
import { ConfigService } from '@nestjs/config';
import { SubgraphBlockResponseDto } from '../../shared/dtos/subgraph-block.dto';

const BLOCK_QUERY = `
  query {
    _meta {
      block {
        number
        hash
      }
    }
  }
`;

@Injectable()
export class SubgraphBlockHelper {
  private readonly logger = new Logger(SubgraphBlockHelper.name);

  constructor(private readonly configService: ConfigService) {}

  private async fetchWithRetry<T>(operation: () => Promise<T>, retries = 3): Promise<T> {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        this.logger.warn(`Attempt ${attempt} failed: ${error.message}`);
        if (attempt === retries) throw error;
        await new Promise(resolve => setTimeout(resolve, Math.min(1000 * attempt, 2000)));
      }
    }
    throw new Error('All retry attempts failed');
  }

  async getCurrentBlock(graphqlUrl: string): Promise<{ number: number; hash: string }> {
    try {
      // Create a new GraphQL client for this specific subgraph URL with auth token
      const authToken = this.configService.get<string>('SUBGRAPH_AUTH_TOKEN');
      const graph = new GraphQLClient(graphqlUrl, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      // Fetch from subgraph
      const response = await this.fetchWithRetry<SubgraphBlockResponseDto>(async () => {
        const result = await graph.request<SubgraphBlockResponseDto>(BLOCK_QUERY);

        if (!result || !result._meta || !result._meta.block) {
          throw new Error('Invalid response from subgraph');
        }

        return result;
      });

      return {
        number: response._meta.block.number,
        hash: response._meta.block.hash,
      };
    } catch (error) {
      this.logger.error(`Error fetching block from subgraph: ${error.message}`, error.stack);
      throw error;
    }
  }
} 