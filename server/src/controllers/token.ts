import jwt from "jsonwebtoken";
import { config } from "dotenv";
import bcryptjs from "bcryptjs";
import { Request, Response, NextFunction } from "express";
import RefreshToken from "@/models/refreshToken";
import { IUser } from "@/models/user";
import { redisService } from "@/services/redis";

config();

export interface UserPayload {
  id: string;
  role: "ADMIN" | "USER";
  username: string;
  email: string;
  image: string;
  hasOnboarded: boolean;
}

export type AuthenticatedRequest = Request & {
  user: UserPayload;
  redis: typeof redisService;
};

export const generateAccessToken = (user: IUser): string => {
  const secret = process.env.SECRET_ACCESS_TOKEN as string;
  if (!secret) throw new Error("SECRET_ACCESS_TOKEN is not defined");

  return jwt.sign(
    {
      id: user.id || user._id,
      role: user.role,
      username: user.username,
      email: user.email,
      image: user.image,
      hasOnboarded: user.hasOnboarded,
    },
    secret,
    {
      expiresIn: "3h",
    }
  );
};

export const generateRefreshToken = async (user: IUser): Promise<string> => {
  const secret = process.env.SECRET_REFRESH_TOKEN as string;
  if (!secret) throw new Error("SECRET_REFRESH_TOKEN is not defined");

  const refreshToken = jwt.sign(
    {
      id: user._id || user.id,
      role: user.role,
      username: user.username,
      email: user.email,
      image: user.image,
      hasOnboarded: user.hasOnboarded,
    },
    secret,
    {
      expiresIn: "30d",
    }
  );
  const hashedToken = await bcryptjs.hash(refreshToken, 10);

  await RefreshToken.create({
    tokenHash: hashedToken,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    userId: user._id || user.id,
  });

  return refreshToken;
};

export const authenticate = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    res.status(401).json({ message: "No token provided" });
    return;
  }

  try {
    const secret = process.env.SECRET_ACCESS_TOKEN as string;
    if (!secret) throw new Error("SECRET_ACCESS_TOKEN is not defined");

    const decoded = jwt.verify(token, secret) as UserPayload;
    req.user = decoded;
    next();
  } catch (error) {
    console.error(error);
    res.status(401).json({ message: "Invalid or expired token" });
  }
};

export const authorizeRole = (role: string) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user || req.user.role !== role) {
      return res.status(403).json({ error: "Forbidden" });
    }
    next();
  };
};
