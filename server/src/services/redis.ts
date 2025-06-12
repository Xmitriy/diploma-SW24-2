import { createClient, RedisClientType } from "redis";
import { config } from "dotenv";
config();

type RedisValue = string | null;

class RedisService {
  private client: RedisClientType | null = null;
  private isConnected: boolean = false;
  private fallbackCache: Map<string, string> = new Map();

  constructor() {
    this.initialize();
  }

  private async initialize(): Promise<void> {
    try {
      const redisUrl = process.env.REDIS_URL as string;
      if (!redisUrl) {
        console.warn(
          "REDIS_URL not found in environment variables, using fallback cache"
        );
        return;
      }

      this.client = createClient({
        url: redisUrl,
        socket: {
          reconnectStrategy: (retries) => {
            if (retries > 10) {
              console.warn(
                "Max reconnection attempts reached, using fallback cache"
              );
              return false;
            }
            return Math.min(retries * 100, 3000);
          },
        },
      });

      this.client.on("error", (err) => {
        console.warn("Redis error:", err.message);
        this.isConnected = false;
      });

      this.client.on("connect", async () => {
        try {
          const pong = await this.client!.ping();
          if (pong === "PONG") {
            console.log("Redis connected and responding successfully");
            this.isConnected = true;
          } else {
            console.warn("Redis ping returned unexpected result:", pong);
            this.isConnected = false;
          }
        } catch (err: any) {
          console.warn("Redis ping failed:", err.message);
          this.isConnected = false;
        }
      });

      this.client.on("end", () => {
        console.warn("Redis connection ended");
        this.isConnected = false;
      });

      await this.client.connect();
    } catch (err: any) {
      console.warn(
        "Failed to initialize Redis, using fallback cache:",
        err.message
      );
      this.isConnected = false;
    }
  }

  async get(key: string): Promise<RedisValue> {
    if (!key) {
      console.warn("Attempted to get with null/undefined key");
      return null;
    }

    try {
      if (this.isConnected && this.client) {
        const result = await this.client.get(key);
        if (result) {
          console.log("Redis get successful for key:", key);
        }
        return result;
      }
      console.warn("Using fallback cache for get:", key);
      return this.fallbackCache.get(key) ?? null;
    } catch (err: any) {
      console.warn(
        "Error getting from Redis, using fallback cache:",
        err.message
      );
      return this.fallbackCache.get(key) ?? null;
    }
  }

  async set(
    key: string,
    value: string,
    expireTime: number = 3600
  ): Promise<void> {
    if (!key || value === undefined) {
      console.warn("Attempted to set with null/undefined key or value");
      return;
    }

    try {
      if (this.isConnected && this.client) {
        await this.client.set(key, value, { EX: expireTime });
        console.log("Successfully cached in Redis:", key);
      } else {
        console.warn("Using fallback cache for set:", key);
      }
      this.fallbackCache.set(key, value);
      setTimeout(() => {
        this.fallbackCache.delete(key);
      }, expireTime * 1000);
    } catch (err: any) {
      console.warn(
        "Error setting in Redis, using fallback cache:",
        err.message
      );
      this.fallbackCache.set(key, value);
      setTimeout(() => {
        this.fallbackCache.delete(key);
      }, expireTime * 1000);
    }
  }

  async delete(key: string): Promise<void> {
    if (!key) {
      console.warn("Attempted to delete with null/undefined key");
      return;
    }

    try {
      if (this.isConnected && this.client) {
        await this.client.del(key);
        console.log("Successfully deleted from Redis:", key);
      } else {
        console.warn("Using fallback cache for delete:", key);
      }
      this.fallbackCache.delete(key);
    } catch (err: any) {
      console.warn("Error deleting from Redis:", err.message);
      this.fallbackCache.delete(key);
    }
  }

  isRedisAvailable(): boolean {
    return this.isConnected;
  }
}

export const redisService = new RedisService();
