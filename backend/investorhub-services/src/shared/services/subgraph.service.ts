import { ConfigService } from '@nestjs/config';
import { GraphQLClient } from 'graphql-request';

export const GraphQLClientProvider = {
  provide: 'GRAPHQL_CLIENT',
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => {
    const endpoint = configService.get<string>('UNISWAP_V3_SUBGRAPH') || '';
    return new GraphQLClient(endpoint, {
      headers: {
        // Adicione headers se necessário, ex: Authorization
        Authorization: `Bearer ${configService.get('SUBGRAPH_AUTH_TOKEN')}`,
      },
    });
  },
};