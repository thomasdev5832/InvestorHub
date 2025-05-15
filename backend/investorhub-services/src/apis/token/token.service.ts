import { Injectable, Logger, NotFoundException, ConflictException } from '@nestjs/common';
import { Token } from '../../database/schemas/token.schema';
import { CreateTokenDto, UpdateTokenDto, TokenResponseDto } from './dto/token-response.dto';
import { TokenRepository } from './token.repository';

@Injectable()
export class TokenService {
  private readonly logger = new Logger(TokenService.name);

  constructor(
    private readonly tokenRepository: TokenRepository,
  ) {}

  async create(createTokenDto: CreateTokenDto): Promise<TokenResponseDto> {
    try {
      this.logger.log(`Creating token with data: ${JSON.stringify(createTokenDto)}`);
      
      const existingToken = await this.tokenRepository.findByAddress(createTokenDto.address);

      if (existingToken) {
        throw new ConflictException('Token with this symbol or name already exists');
      }

      const savedToken = await this.tokenRepository.create(createTokenDto);
      
      this.logger.log(`Token created successfully with id: ${savedToken.id}`);
      return this.mapToResponseDto(savedToken);
    } catch (error) {
      this.logger.error(`Error creating token: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findAll(): Promise<TokenResponseDto[]> {
    try {
      this.logger.log('Fetching all tokens');
      const tokens = await this.tokenRepository.findAll();
      this.logger.log(`Found ${tokens.length} tokens`);
      return tokens.map(token => this.mapToResponseDto(token));
    } catch (error) {
      this.logger.error(`Error fetching tokens: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findOne(id: string): Promise<TokenResponseDto> {
    try {
      this.logger.log(`Fetching token with id: ${id}`);
      const token = await this.tokenRepository.findById(id);
      
      if (!token) {
        throw new NotFoundException(`Token with id ${id} not found`);
      }
      
      this.logger.log(`Token found: ${token.symbol}`);
      return this.mapToResponseDto(token);
    } catch (error) {
      this.logger.error(`Error fetching token with id ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findBySymbol(symbol: string): Promise<TokenResponseDto> {
    try {
      this.logger.log(`Fetching token with symbol: ${symbol}`);
      const token = await this.tokenRepository.findBySymbol(symbol);
      
      if (!token) {
        throw new NotFoundException(`Token with symbol ${symbol} not found`);
      }
      
      this.logger.log(`Token found: ${token.name}`);
      return this.mapToResponseDto(token);
    } catch (error) {
      this.logger.error(`Error fetching token with symbol ${symbol}: ${error.message}`, error.stack);
      throw error;
    }
  }

  async update(id: string, updateTokenDto: UpdateTokenDto): Promise<TokenResponseDto> {
    try {
      this.logger.log(`Updating token with id: ${id}, data: ${JSON.stringify(updateTokenDto)}`);
      
      const token = await this.tokenRepository.update(
        id,
        { ...updateTokenDto }
      );
      
      if (!token) {
        throw new NotFoundException(`Token with id ${id} not found`);
      }
      
      this.logger.log(`Token updated successfully: ${token.symbol}`);
      return this.mapToResponseDto(token);
    } catch (error) {
      this.logger.error(`Error updating token with id ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    try {
      this.logger.log(`Deleting token with id: ${id}`);
      const result = await this.tokenRepository.delete(id);
      
      if (!result) {
        throw new NotFoundException(`Token with id ${id} not found`);
      }
      
      this.logger.log(`Token deleted successfully: ${result.symbol}`);
    } catch (error) {
      this.logger.error(`Error deleting token with id ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  private mapToResponseDto(token: Token): TokenResponseDto {
    return {
      id: token.id.toString(),
      name: token.name,
      symbol: token.symbol,
      imageUrl: token.imageUrl,
    };
  }
}
