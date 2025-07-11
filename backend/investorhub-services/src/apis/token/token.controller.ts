import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  Query,
  ValidationPipe,
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiParam,
  ApiQuery,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiConflictResponse,
  ApiInternalServerErrorResponse
} from '@nestjs/swagger';
import { TokenService } from './token.service';
import { CreateTokenDto, UpdateTokenDto, TokenResponseDto, TokenQueryDto } from './dto/token-response.dto';

@ApiTags('Tokens')
@Controller('tokens')
export class TokenController {
  constructor(private readonly tokenService: TokenService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new token' })
  @ApiResponse({ 
    status: 201, 
    description: 'Token created successfully', 
    type: TokenResponseDto 
  })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  @ApiConflictResponse({ description: 'Token with this symbol or name already exists' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  async create(
    @Body(ValidationPipe) createTokenDto: CreateTokenDto
  ): Promise<TokenResponseDto> {
    return this.tokenService.create(createTokenDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all tokens' })
  @ApiQuery({ 
    name: 'chainId', 
    description: 'Chain ID to filter tokens by network', 
    example: 11155111, 
    required: false 
  })
  @ApiQuery({ 
    name: 'whitelist', 
    description: 'Filter tokens by whitelist status', 
    example: true, 
    required: false 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'List of tokens', 
    type: [TokenResponseDto] 
  })
  @ApiNotFoundResponse({ description: 'Network with specified chainId not found' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  async findAll(
    @Query('chainId') chainId?: string,
    @Query('whitelist') whitelist?: string
  ): Promise<TokenResponseDto[]> {
    const chainIdNumber = chainId ? parseInt(chainId, 10) : undefined;
    const whitelistBoolean = whitelist !== undefined ? whitelist === 'true' : undefined;
    return this.tokenService.findAll(chainIdNumber, whitelistBoolean);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search token by symbol' })
  @ApiQuery({ name: 'symbol', description: 'Token symbol to search for', example: 'ETH' })
  @ApiResponse({ 
    status: 200, 
    description: 'Token found', 
    type: TokenResponseDto 
  })
  @ApiNotFoundResponse({ description: 'Token not found' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  async findBySymbol(
    @Query('symbol') symbol: string
  ): Promise<TokenResponseDto> {
    return this.tokenService.findBySymbol(symbol);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get token by ID' })
  @ApiParam({ name: 'id', description: 'Token ID', example: '507f1f77bcf86cd799439011' })
  @ApiResponse({ 
    status: 200, 
    description: 'Token found', 
    type: TokenResponseDto 
  })
  @ApiNotFoundResponse({ description: 'Token not found' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  async findOne(@Param('id') id: string): Promise<TokenResponseDto> {
    return this.tokenService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update token by ID' })
  @ApiParam({ name: 'id', description: 'Token ID', example: '507f1f77bcf86cd799439011' })
  @ApiResponse({ 
    status: 200, 
    description: 'Token updated successfully', 
    type: TokenResponseDto 
  })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  @ApiNotFoundResponse({ description: 'Token not found' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  async update(
    @Param('id') id: string,
    @Body(ValidationPipe) updateTokenDto: UpdateTokenDto
  ): Promise<TokenResponseDto> {
    return this.tokenService.update(id, updateTokenDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete token by ID' })
  @ApiParam({ name: 'id', description: 'Token ID', example: '507f1f77bcf86cd799439011' })
  @ApiResponse({ 
    status: 200, 
    description: 'Token deleted successfully' 
  })
  @ApiNotFoundResponse({ description: 'Token not found' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    await this.tokenService.remove(id);
    return { message: 'Token deleted successfully' };
  }
}
