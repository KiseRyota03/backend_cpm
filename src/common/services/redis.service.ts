import { Injectable } from '@nestjs/common';
import * as Redis from 'ioredis';

@Injectable()
export class RedisService {
  private redis = new Redis(process.env.REDIS_URL as string);

  async set(key: string, value: string, expirySeconds?: number) {
    if (expirySeconds) {
      await this.redis.set(key, value, 'EX', expirySeconds);
    } else {
      await this.redis.set(key, value);
    }
  }

  async get(key: string): Promise<string | null> {
    return await this.redis.get(key);
  }

  async del(key: string): Promise<void> {
    await this.redis.del(key);
  }
}
