import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { TokenService } from '../../services/token.service';
import { ErrorResponseDto } from '../../../shared/dtos/error-response.dto';
import { Token } from '../../schemas/token.schema';

@ApiTags('Tokens')
@Controller('tokens')
export class TokenController {
  constructor(private readonly tokenService: TokenService) {}

  @Get()
  @ApiOperation({ summary: 'Get all tokens' })
  @ApiResponse({ status: 200, description: 'Tokens retrieved successfully', type: Token })
  @ApiResponse({ status: 503, description: 'Service temporarily unavailable', type: ErrorResponseDto })
  async getAllTokens(): Promise<Token[]> {
    return this.tokenService.getAllTokens();
  }
}
