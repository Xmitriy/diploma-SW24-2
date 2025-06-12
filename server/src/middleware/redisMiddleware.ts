import { redisService } from "@/services/redis";
import { Request, Response, NextFunction } from "express";

export const redisMiddleware = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  req.redis = redisService;
  next();
};
