import { NetworkConfigRepository } from '../repositories/network-config.repository';
import { TokenRepository } from '../repositories/token.repository';
import { MigrationRepository } from '../repositories/migration.repository';
import { ProtocolConfigRepository } from '../repositories/protocol-config.repository';
import { Types } from 'mongoose';

export const name = '001-initial-network-tokens';

export async function up(
  networkConfigRepository: NetworkConfigRepository,
  tokenRepository: TokenRepository,
  migrationRepository: MigrationRepository,
  protocolConfigRepository: ProtocolConfigRepository,
): Promise<void> {
  // Check if migration was already executed
  const existingMigration = await migrationRepository.findOne({ name });
  if (existingMigration) {
    console.log(`Migration ${name} was already executed`);
    return;
  }

  // Create protocol configs first
  const ethereumProtocolConfig = await protocolConfigRepository.create({
    uniswapV3Url: 'https://gateway.thegraph.com/api/subgraphs/id/5zvR82QoaXYFyDEKLZ9t6v9adgnptxYpKpSbxtgVENFV',
    uniswapV4Url: '', // To be filled later
    isActive: true,
  });

  const baseProtocolConfig = await protocolConfigRepository.create({
    uniswapV3Url: 'https://gateway.thegraph.com/api/subgraphs/id/HMuAwufqZ1YCRmzL2SfHTVkzZovC9VL2UAKhjvRqKiR1',
    uniswapV4Url: '', // To be filled later
    isActive: true,
  });

  // Create network configs
  const ethereumNetwork = await networkConfigRepository.create({
    name: 'Ethereum Mainnet',
    chainId: 1,
    rpcUrl: 'https://eth.llamarpc.com',
    currency: 'ETH',
    isActive: true,
  });

  const baseNetwork = await networkConfigRepository.create({
    name: 'Base Mainnet',
    chainId: 8453,
    rpcUrl: 'https://mainnet.base.org',
    currency: 'ETH',
    isActive: true,
  });

  // Update protocol configs with network references
  await protocolConfigRepository.addNetwork(
    ethereumProtocolConfig._id as Types.ObjectId,
    ethereumNetwork._id as Types.ObjectId
  );

  await protocolConfigRepository.addNetwork(
    baseProtocolConfig._id as Types.ObjectId,
    baseNetwork._id as Types.ObjectId
  );

  // Token addresses
  const tokenAddresses = {
    ethereum: {
      weth: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
      usdt: '0xdac17f958d2ee523a2206206994597c13d831ec7',
      usdc: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
      wbtc: '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599',
      link: '0x514910771af9ca656af840dff83e8264ecf986ca',
    },
    base: {
      weth: '0x4200000000000000000000000000000000000006',
      usdt: '0x50c5725949a6f0c72e6c4a641f24049a917db0cb',
      usdc: '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913',
      wbtc: '0x1d1c4b7b4f5b5b5b5b5b5b5b5b5b5b5b5b5b5b5',
      link: '0x88fb150bdc53a65fe94dea0c9ba0a6daf8c6e196',
    },
  };

  if (ethereumNetwork && ethereumNetwork._id) {
    // Create tokens for Ethereum
    await tokenRepository.createMany([
      {
        name: 'Wrapped Ether',
        symbol: 'WETH',
        address: tokenAddresses.ethereum.weth,
        network: ethereumNetwork._id,
      },
      {
        name: 'Tether USD',
        symbol: 'USDT',
        address: tokenAddresses.ethereum.usdt,
        network: ethereumNetwork._id,
      },
      {
        name: 'USD Coin',
        symbol: 'USDC',
        address: tokenAddresses.ethereum.usdc,
        network: ethereumNetwork._id,
      },
      {
        name: 'Wrapped Bitcoin',
        symbol: 'WBTC',
        address: tokenAddresses.ethereum.wbtc,
        network: ethereumNetwork._id,
      },
      {
        name: 'Chainlink',
        symbol: 'LINK',
        address: tokenAddresses.ethereum.link,
        network: ethereumNetwork._id,
      },
    ]);
  }

  if (baseNetwork && baseNetwork._id) {
    // Create tokens for Base
    await tokenRepository.createMany([
      {
        name: 'Wrapped Ether',
        symbol: 'WETH',
        address: tokenAddresses.base.weth,
        network: baseNetwork._id,
      },
      {
        name: 'Tether USD',
        symbol: 'USDT',
        address: tokenAddresses.base.usdt,
        network: baseNetwork._id,
      },
      {
        name: 'USD Coin',
        symbol: 'USDC',
        address: tokenAddresses.base.usdc,
        network: baseNetwork._id,
      },
      {
        name: 'Wrapped Bitcoin',
        symbol: 'WBTC',
        address: tokenAddresses.base.wbtc,
        network: baseNetwork._id,
      },
      {
        name: 'Chainlink',
        symbol: 'LINK',
        address: tokenAddresses.base.link,
        network: baseNetwork._id,
      },
    ]);
  }

  // Record migration
  await migrationRepository.create({
    name,
    executedAt: new Date(),
  });

  console.log(`Migration ${name} executed successfully`);
}

export async function down(
  networkConfigRepository: NetworkConfigRepository,
  tokenRepository: TokenRepository,
  migrationRepository: MigrationRepository,
  protocolConfigRepository: ProtocolConfigRepository,
): Promise<void> {
  // Remove all tokens
  await tokenRepository.deleteMany({});
  
  // Remove network configs
  await networkConfigRepository.deleteMany({});
  
  // Remove protocol configs
  await protocolConfigRepository.deleteMany({});
  
  // Remove migration record
  await migrationRepository.deleteOne({ name });
  
  console.log(`Migration ${name} reverted successfully`);
} 