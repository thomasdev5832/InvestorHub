// src/redis/redis.service.ts
import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit {
    private client: Redis;
    private readonly logger = new Logger(RedisService.name);

    constructor(private configService: ConfigService) {}

    onModuleInit() {
        const host = this.configService.get<string>('REDIS_HOST');
        const port = this.configService.get<number>('REDIS_PORT');
        const password = this.configService.get<string>('REDIS_PASSWORD');

        this.logger.log(`Initializing Redis client with host: ${host}, port: ${port}`);

        try {
            // Create Redis client with proper configuration
            this.client = new Redis({
                host,
                port,
                password,
                // Use TCP connection instead of HTTP
                enableOfflineQueue: true,
                // Disable auto-reconnect to prevent potential issues
                lazyConnect: true,
                // Set a proper connection name
                name: 'nestjs_app_investorhub',
                // Set proper retry strategy
                retryStrategy: (times) => {
                    const delay = Math.min(times * 50, 2000);
                    return delay;
                },
            });

            // Set up event listeners
            this.client.on('error', (error) => {
                this.logger.error('Redis client error:', error);
            });

            this.client.on('connect', () => {
                this.logger.log('Redis client connected');
            });

            // Connect to Redis
            this.client.connect().catch(err => {
                this.logger.error('Failed to connect to Redis:', err);
            });
        } catch (error) {
            this.logger.error('Failed to initialize Redis client:', error);
            throw error;
        }
    }

    async get(key: string): Promise<string | null> {
        try {
            return await this.client.get(key);
        } catch (error) {
            this.logger.error(`Error getting key ${key}:`, error);
            throw error;
        }
    }

    async set(key: string, value: string, ttlSeconds = 60): Promise<void> {
        try {
            await this.client.set(key, value, 'EX', ttlSeconds); // expira em X segundos
        } catch (error) {
            this.logger.error(`Error setting key ${key}:`, error);
            throw error;
        }
    }

    async getClient(): Promise<Redis> {
        return this.client;
    }
}