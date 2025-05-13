import { Injectable, NotFoundException } from '@nestjs/common';
import { TokenRepository } from '../repositories/token.repository';
import { Token } from '../schemas/token.schema';

@Injectable()
export class TokenService {
  constructor(private readonly tokenRepository: TokenRepository) {}

  async createToken(tokenData: Partial<Token>): Promise<Token> {
    if (!tokenData.address) {
      throw new Error('Token address is required');
    }
    const existingToken = await this.tokenRepository.findByAddress(tokenData.address);
    if (existingToken) {
      throw new Error('Token with this address already exists');
    }
    return this.tokenRepository.create(tokenData);
  }

  async getAllTokens(): Promise<Token[]> {
    return this.tokenRepository.findAll();
  }

  async getTokenById(id: string): Promise<Token> {
    const token = await this.tokenRepository.findById(id);
    if (!token) {
      throw new NotFoundException(`Token with ID ${id} not found`);
    }
    return token;
  }

  async getTokenByAddress(address: string): Promise<Token> {
    const token = await this.tokenRepository.findByAddress(address);
    if (!token) {
      throw new NotFoundException(`Token with address ${address} not found`);
    }
    return token;
  }

  async updateToken(id: string, tokenData: Partial<Token>): Promise<Token> {
    const token = await this.tokenRepository.update(id, tokenData);
    if (!token) {
      throw new NotFoundException(`Token with ID ${id} not found`);
    }
    return token;
  }

  async deleteToken(id: string): Promise<void> {
    const token = await this.tokenRepository.delete(id);
    if (!token) {
      throw new NotFoundException(`Token with ID ${id} not found`);
    }
  }
} 