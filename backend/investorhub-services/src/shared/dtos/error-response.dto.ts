import { ApiProperty } from '@nestjs/swagger';

export class ErrorResponseDto {
  @ApiProperty({
    example: 'Something went wrong',
    description: 'Description of the error',
  })
  message: string;

  @ApiProperty({
    example: 'Internal Server Error',
    description: 'HTTP error type (ex: Bad Request, Not Found, Internal Server Error)',
  })
  error: string;

  @ApiProperty({
    example: 'XXX',
    description: 'HTTP response (ex: 400, 404, 500)',
  })
  statusCode: number;
}