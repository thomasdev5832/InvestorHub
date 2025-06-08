import { ApiProperty } from '@nestjs/swagger';

export class ErrorResponseDto {
  @ApiProperty({ example: 404, description: 'HTTP status code' })
  statusCode: number;

  @ApiProperty({ example: 'Token not found', description: 'Error message' })
  message: string;

  @ApiProperty({ example: 'Not Found', description: 'Error type' })
  error: string;

  @ApiProperty({ example: '2023-12-01T00:00:00.000Z', description: 'Timestamp of the error' })
  timestamp: string;

  @ApiProperty({ example: '/api/tokens/507f1f77bcf86cd799439011', description: 'Request path' })
  path: string;
}
