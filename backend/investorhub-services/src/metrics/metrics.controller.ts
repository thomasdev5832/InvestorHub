import { Controller, Get } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { Registry } from 'prom-client';

@ApiExcludeController()
@Controller('metrics')
export class MetricsController {
  constructor(private readonly registry: Registry) {}

  @Get()
  async getMetrics(): Promise<string> {
    return this.registry.metrics(); 
  }
} 