// src/redis/redis.service.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit {
    private client: Redis;

    onModuleInit() {
        this.client = new Redis({
            host: 'redis', // nome do serviço no docker-compose
            port: 6379,
        });
    }

    async get(key: string): Promise<string | null> {
        return await this.client.get(key);
    }

    async set(key: string, value: string, ttlSeconds = 60): Promise<void> {
        await this.client.set(key, value, 'EX', ttlSeconds); // expira em X segundos
    }
}