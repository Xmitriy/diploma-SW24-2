import type { RedisService } from "@/services/redis";

declare global {
  namespace Express {
    interface Request {
      redis: RedisService;
      user: UserPayload;
    }
  }
}
