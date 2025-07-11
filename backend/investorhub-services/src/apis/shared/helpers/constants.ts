import { NetworkConfig } from "../interfaces/NetworkConfig";

export const NETWORKS_CONFIGS: { [key: string]: NetworkConfig } = {
  'eip155:11155111': {
    providerUrl: 'https://gateway.tenderly.co/public/sepolia',
    positionManagerAddress: '0x1238536071E1c677A632429e3655c799b22cDA52',
    factoryAddress: '0x0227628f3F023bb0B980b67D528571c95c6DaC1c',
  },
  'eip155:84532': {
    providerUrl: 'https://sepolia.base.org',
    positionManagerAddress: '0x4B8C80fBcB71E4b38A8ed8c0c3d4b4d6c83f5c8e',
    factoryAddress: '0x4752ba5DBc23f44D87826276BF6Fd6b1C372aD24',
  },
  'eip155:1': {
    providerUrl: 'https://eth.llamarpc.com',
    positionManagerAddress: '0xC36442b4a4522E871399CD717aBDD847Ab11FE88',
    factoryAddress: '0x1F98431c8aD98523631AE4a59f267346ea31F984',
  },
  'eip155:8453': {
    providerUrl: 'https://mainnet.base.org',
    positionManagerAddress: '0x03a520b7C8bF7E5F4A2b7F3C8F8C8F8C8F8C8F8C',
    factoryAddress: '0x33128a8fC17869897dcE68Ed026d694621f6FDfD',
  },
};