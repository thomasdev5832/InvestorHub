import { Injectable } from '@nestjs/common';
import { Histogram, Gauge, Counter, register } from 'prom-client';

@Injectable()
export class SubgraphMetricsService {
  private readonly responseTimeHistogram: Histogram<string>;
  private readonly requestTotal: Gauge<string>;
  private readonly errorsTotal: Gauge<string>;
  private readonly poolOperations: Counter<string>;

  constructor() {
    this.responseTimeHistogram = new Histogram({
      name: 'subgraph_response_time_seconds',
      help: 'Histogram of subgraph response times in seconds',
      labelNames: ['query_name', 'status'],
      buckets: [0.1, 0.5, 1, 2, 5, 10, 30, 60],
      registers: [register],
    });

    this.requestTotal = new Gauge({
      name: 'subgraph_requests_total',
      help: 'Total number of subgraph requests',
      labelNames: ['query_name', 'status'],
      registers: [register],
    });

    this.errorsTotal = new Gauge({
      name: 'subgraph_errors_total',
      help: 'Total number of subgraph errors',
      labelNames: ['query_name', 'error_type'],
      registers: [register],
    });
    
    this.poolOperations = new Counter({
      name: 'pool_operations_total',
      help: 'Total number of pool operations',
      labelNames: ['operation', 'status'],
      registers: [register],
    });
  }

  recordResponseTime(queryName: string, duration: number, status: string) {
    this.responseTimeHistogram.labels(queryName, status).observe(duration);
    this.requestTotal.labels(queryName, status).inc();
  }

  recordError(queryName: string, errorType: string) {
    this.errorsTotal.labels(queryName, errorType).inc();
  }
  
  recordPoolOperation(operation: string, status: string) {
    this.poolOperations.labels(operation, status).inc();
  }
} 