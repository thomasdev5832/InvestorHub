import { Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GraphQLClient } from 'graphql-request';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: 'GRAPHQL_MAINNET_CLIENT',
      useFactory: (configService: ConfigService) => {
        const logger = new Logger('GraphQLMainnetModule');
        const subgraphUrl = configService.get<string>('UNISWAP_V3_SUBGRAPH_MAINNET');
        
        if (!subgraphUrl) {
          logger.error('UNISWAP_V3_SUBGRAPH_MAINNET environment variable is not set');
          throw new Error('UNISWAP_V3_SUBGRAPH_MAINNET environment variable is not set');
        }

        logger.log(`Initializing GraphQL client with URL: ${subgraphUrl}`);
        
        const client = new GraphQLClient(subgraphUrl);
        
        // Add headers if needed
        const authToken = configService.get<string>('SUBGRAPH_AUTH_TOKEN');
        if (authToken) {
          client.setHeader('Authorization', `Bearer ${authToken}`);
        }
        
        return client;
      },
      inject: [ConfigService],
    },
  ],
  exports: ['GRAPHQL_MAINNET_CLIENT'],
})
export class GraphQLMainnetModule {} 