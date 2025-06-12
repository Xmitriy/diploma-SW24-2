import { Request, Response } from "express";
import { validationResult } from "express-validator";
import jwt from "jsonwebtoken";
import bcryptjs from "bcryptjs";
import mongoose from "mongoose";
import User, { IUser } from "@/models/user";
import {
  AuthenticatedRequest,
  generateAccessToken,
  generateRefreshToken,
  UserPayload,
} from "./token";
import { transporter } from "@/services/nodemailer";
import RefreshToken from "@/models/refreshToken";
import axios from "axios";
import * as jose from "jose";
import { BASE_URL } from "@/routes/constants";
import { APP_SCHEME } from "@/routes/constants";
import { uploadProfileImage } from "@/helpers/uploadImage";
import { redisService } from "@/services/redis";
import DailyGoal from "@/models/dailyGoal";
import { generateDailyGoals } from "@/services/aiGoals";
import genFoodPlan from "@/services/aiFood";
import analyzeFoodImage from "@/services/aiFoodImage";
import genExercisePlan from "@/services/aiExercisePlan";

const { genSaltSync, hashSync, compareSync } = bcryptjs;
const hashRounds = 10;

async function updateUserGoals(user: IUser) {
  try {
    let dailyGoal = await DailyGoal.findOne({ userId: user._id });

    if (!dailyGoal) {
      dailyGoal = new DailyGoal({ userId: user._id });
    }

    if (dailyGoal.needsUpdate()) {
      const newGoals = await generateDailyGoals({
        age: user.birthday
          ? Math.floor(
              (Date.now() - new Date(user.birthday).getTime()) /
                (365.25 * 24 * 60 * 60 * 1000)
            )
          : undefined,
        weight: user.weight,
        height: user.height,
        gender: user.gender,
        activityLevel: user.activityLevel,
        healthConditions: user.healthCondition
          ? [user.healthCondition]
          : undefined,
      });

      Object.assign(dailyGoal, newGoals);
      await dailyGoal.save();
    }

    return dailyGoal.toJSON();
  } catch (error) {
    console.error("Error updating user goals:", error);
    return null;
  }
}

class AuthController {
  public static async login(req: Request, res: Response): Promise<any> {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader?.startsWith("Bearer ")
        ? authHeader.slice(7)
        : null;

      if (token) {
        const decoded = jwt.verify(
          token,
          process.env.SECRET_ACCESS_TOKEN as string
        ) as UserPayload;

        if (!decoded) {
          return res.status(403).json({ message: "Invalid token" });
        }

        // redis get
        const redisUser = await redisService.get(`user:${decoded.id}`);

        if (redisUser) {
          const parsedUser = JSON.parse(redisUser);
          const accessToken = generateAccessToken(parsedUser);
          const refreshToken = await generateRefreshToken(parsedUser);
          return res.status(200).json({
            message: "User logged in successfully with token",
            user: parsedUser,
            accessToken,
            refreshToken,
          });
        }

        const user = await User.findById(decoded.id).select([
          "-password",
          "-emailVerificationToken",
        ]);

        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }

        const dailyGoal = await updateUserGoals(user);
        const userData = {
          ...user.toJSON(),
          dailyGoals: dailyGoal,
        };

        await redisService.set(`user:${user._id}`, JSON.stringify(userData));

        const accessToken = generateAccessToken(user);
        const refreshToken = await generateRefreshToken(user);

        return res.json({
          message: "User logged in successfully with token",
          user: userData,
          accessToken,
          refreshToken,
        });
      }

      const { password, email } = req?.body;
      if (!password || !email)
        return res.status(400).json({ message: "Missing password or email" });

      const user = await User.findOne({ email: email.toLowerCase() })
        .select("-emailVerificationToken")
        .exec();
      if (!user) return res.status(404).json({ message: "User not found" });

      const match = compareSync(password, user.password);
      if (!match)
        return res.status(401).json({ message: "Password does not match" });

      const dailyGoal = await updateUserGoals(user);
      const userData = {
        ...user.toJSON(),
        dailyGoals: dailyGoal,
      };

      if ("password" in userData) {
        delete (userData as { password?: string }).password;
      }

      await redisService.set(`user:${user._id}`, JSON.stringify(userData));

      const accessToken = generateAccessToken(user);
      const refreshToken = await generateRefreshToken(user);

      res.json({
        message: "User logged in successfully",
        user: userData,
        accessToken,
        refreshToken,
      });
    } catch (e) {
      console.error("login error:", e);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }

  public static async register(req: Request, res: Response): Promise<any> {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    const { email, password } = req.body;

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const existingUser = await User.findOne({ email })
        .session(session)
        .exec();
      if (existingUser) {
        await session.abortTransaction();
        return res.status(400).json({ message: "User already exists" });
      }

      const salt = genSaltSync(hashRounds);
      const hashedPassword = hashSync(password, salt);

      const newUser = (
        await User.create([{ ...req.body, password: hashedPassword }], {
          session,
        })
      )[0] as IUser;

      const accessToken = generateAccessToken(newUser);
      const refreshToken = await generateRefreshToken(newUser);
      const dailyGoal = await updateUserGoals(newUser);

      await session.commitTransaction();

      const userObj = {
        ...newUser.toJSON(),
        dailyGoals: dailyGoal,
      };

      if ("password" in userObj) {
        delete userObj.password;
      }

      res.status(201).json({
        message: "User registered successfully",
        user: userObj,
        accessToken,
        refreshToken,
      });
    } catch (e) {
      await session.abortTransaction();
      console.error("register error:", e);
      res.status(500).json({ message: "Internal Server Error" });
    } finally {
      session.endSession();
    }
  }

  public static async update(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<any> {
    if ((!req.body || Object.keys(req.body).length === 0) && !req.file) {
      return res.status(400).json({ message: "Request is empty" });
    }

    const { password, newPassword, ...otherBodyFields } = req.body;
    const image = req.file;
    let willUpdatePassword = false;
    let hashedPassword;
    try {
      const user = await User.findById(req.user.id).exec();
      if (!user) return res.status(404).json({ message: "User not found" });

      if (newPassword && password) {
        const match = compareSync(password, user.password);
        if (!match)
          return res.status(401).json({ message: "Passwords don't match" });
        if (newPassword === password)
          return res.status(400).json({
            message: "New password cannot be the same as the old password",
          });
        willUpdatePassword = true;
        const salt = genSaltSync(hashRounds);
        hashedPassword = hashSync(newPassword, salt);
      }

      const updateData: any = { ...otherBodyFields };

      if (image) {
        updateData.image = await uploadProfileImage(image, user);
      }

      if (willUpdatePassword) {
        updateData.password = hashedPassword;
      }

      const newUser = await User.findByIdAndUpdate(req.user.id, updateData, {
        new: true,
      })
        .select("-password -emailVerificationToken")
        .exec();

      req.redis.set(
        `user:${user._id}`,
        JSON.stringify({ ...newUser!.toJSON() })
      );

      const accessToken = generateAccessToken(newUser!);
      const refreshToken = await generateRefreshToken(newUser!);

      return res.status(200).json({
        message: "User updated successfully",
        user: newUser?.toJSON(),
        accessToken,
        refreshToken,
      });
    } catch (e) {
      console.error("update error:", e);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }

  public static async logout(req: Request, res: Response): Promise<any> {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader?.startsWith("Bearer ")
        ? authHeader.slice(7)
        : null;

      if (!token) {
        return res.status(400).json({ message: "No token provided" });
      }

      return jwt.verify(
        token,
        process.env.REFRESH_TOKEN_SECRET as string,
        async (err: Error | null, decoded: any) => {
          if (err) {
            return res.status(403).json({ message: "Invalid token" });
          }

          await User.findByIdAndUpdate(decoded.id, { token: null }).exec();
          await RefreshToken.deleteMany({ userId: decoded.id }).exec();
          res.status(200).json({ message: "User logged out successfully" });
        }
      );
    } catch (e) {
      console.error("logout error:", e);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }

  public static async generateNewToken(
    req: Request,
    res: Response
  ): Promise<any> {
    try {
      let refreshToken = null;
      const authHeader = req.headers.authorization;
      if (authHeader) {
        refreshToken = authHeader.split(" ")[1];
      } else if (req.body.refreshToken) {
        refreshToken = req.body.refreshToken;
      }

      if (!refreshToken) {
        return res.status(400).json({ message: "Refresh token is required" });
      }

      try {
        const decoded = jwt.verify(
          refreshToken,
          process.env.SECRET_REFRESH_TOKEN as string
        ) as UserPayload;

        if (!decoded) {
          return res.status(403).json({ message: "Invalid refresh token" });
        }

        // Try to get user from Redis first
        const redisUser = await redisService.get(`user:${decoded.id}`);
        if (redisUser) {
          const parsedUser = JSON.parse(redisUser);
          const accessToken = generateAccessToken(parsedUser);
          const newRefreshToken = await generateRefreshToken(parsedUser);

          return res.json({
            message: "Tokens generated successfully",
            user: parsedUser,
            accessToken,
            refreshToken: newRefreshToken,
          });
        }

        // If not in Redis, get from DB
        const user = await User.findById(decoded.id)
          .select("-password -emailVerificationToken")
          .exec();

        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }

        const dailyGoal = await updateUserGoals(user);
        const userData = {
          ...user.toJSON(),
          dailyGoals: dailyGoal,
        };

        await redisService.set(`user:${user._id}`, JSON.stringify(userData));

        const accessToken = generateAccessToken(user);
        const newRefreshToken = await generateRefreshToken(user);

        return res.json({
          message: "Tokens generated successfully",
          user: userData,
          accessToken,
          refreshToken: newRefreshToken,
        });
      } catch (jwtError) {
        console.error("JWT verification error:", jwtError);
        return res.status(403).json({ message: "Invalid refresh token" });
      }
    } catch (e) {
      console.error("generateNewToken error:", e);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }

  public static async sendVerificationEmail(
    req: Request,
    res: Response
  ): Promise<any> {
    const { email } = req.body;

    try {
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const token = jwt.sign(
        { id: user._id },
        process.env.EMAIL_VERIFICATION_SECRET as string,
        { expiresIn: "1h" }
      );

      const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${token}`;

      user.emailVerificationToken = token;
      user.emailVerificationTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour expiry
      await user.save();

      const mailOptions = {
        from: process.env.SMTP_USER,
        to: user.email,
        subject: "Email Verification",
        html: `<p>Please click on the link below to verify your email:</p>
               <a href="${verificationUrl}">Verify Email</a>`,
      };

      transporter.sendMail(mailOptions, (error, _info) => {
        if (error) {
          return res.status(500).json({ message: "Error sending email" });
        }
        res.status(200).json({ message: "Verification email sent" });
      });
    } catch (e) {
      console.error("Error sending verification email:", e);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  public static async verifyEmail(req: Request, res: Response): Promise<any> {
    const { token } = req.query;

    try {
      const decoded = jwt.verify(
        token as string,
        process.env.EMAIL_VERIFICATION_SECRET as string
      ) as UserPayload;

      const user = await User.findById(decoded.id).select("-password").exec();
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (user.isEmailVerified) {
        return res.status(400).json({ message: "Email already verified" });
      }

      // Check token expiry
      if (
        user.emailVerificationTokenExpiry &&
        user.emailVerificationTokenExpiry < new Date()
      ) {
        return res.status(400).json({ message: "Token expired" });
      }

      // Set user as verified
      user.isEmailVerified = true;
      user.emailVerificationToken = "";
      user.emailVerificationTokenExpiry = new Date();
      await user.save();

      res.status(200).json({ message: "Email verified successfully" });
    } catch (e) {
      console.error("Error verifying email:", e);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  public static async google(req: Request, res: Response): Promise<any> {
    const { code } = req.body;
    try {
      const response = await axios.post(
        "https://oauth2.googleapis.com/token",
        new URLSearchParams({
          client_id: process.env.GOOGLE_CLIENT_ID as string,
          client_secret: process.env.GOOGLE_CLIENT_SECRET as string,
          redirect_uri: `${BASE_URL}/auth/callback`,
          grant_type: "authorization_code",
          code: code,
        }),
        {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        }
      );
      const data = response.data;
      const userInfo = jose.decodeJwt(data.id_token) as googleUser;
      console.log("userInfo", userInfo);

      const user = await User.findOne({ email: userInfo.email })
        .select("-password -emailVerificationToken")
        .exec();
      if (!user) {
        return res.status(202).json({
          message: "User not found. Ask to register.",
          data: {
            email: userInfo.email,
            username: userInfo.name,
            image: userInfo.picture,
          },
        });
      }
      const accessToken = generateAccessToken(user);
      const refreshToken = await generateRefreshToken(user);
      const dailyGoal = await updateUserGoals(user);

      res.status(200).json({
        user: {
          ...user.toJSON(),
          dailyGoals: dailyGoal,
        },
        accessToken,
        refreshToken,
      });
    } catch (e) {
      console.error("Error verifying email:", e);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  public static async authorize(req: Request, res: Response): Promise<any> {
    try {
      if (!process.env.GOOGLE_CLIENT_ID) {
        return res
          .status(500)
          .json({ error: "Missing GOOGLE_CLIENT_ID environment variable" });
      }

      const url = new URL(
        req.protocol + "://" + req.get("host") + req.originalUrl
      );
      let idpClientId: string;

      const internalClient = url.searchParams.get("client_id");
      const redirectUri = url.searchParams.get("redirect_uri");
      let platform;

      if (redirectUri === APP_SCHEME) {
        platform = "mobile";
      } else if (redirectUri === BASE_URL) {
        platform = "web";
      } else {
        return res.status(400).json({ error: "Invalid redirect_uri" });
      }

      let state = platform + "|" + url.searchParams.get("state");

      if (internalClient === "google") {
        idpClientId = process.env.GOOGLE_CLIENT_ID;
      } else {
        return res.status(400).json({ error: "Invalid client" });
      }

      if (!state) {
        return res.status(400).json({ error: "Invalid state" });
      }

      const params = new URLSearchParams({
        client_id: idpClientId,
        // TODO: GOOGLE_AUTH_URL needs to be defined, possibly from process.env
        // For now, I'll use a placeholder. Replace with actual value.
        redirect_uri: `${BASE_URL}/auth/callback`,
        response_type: "code",
        scope: url.searchParams.get("scope") || "identity",
        state: state,
        prompt: "select_account",
      });

      console.log("redirect_uri", BASE_URL);
      const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
      return res.redirect(GOOGLE_AUTH_URL + "?" + params.toString());
    } catch (e) {
      console.error("authorize error:", e);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }

  public static async callback(req: Request, res: Response): Promise<any> {
    const incomingParams = new URLSearchParams(req.url.split("?")[1]);
    const combinedPlatformAndState = incomingParams.get("state");
    if (!combinedPlatformAndState) {
      return res.status(400).json({ error: "Invalid state" });
    }
    const state = combinedPlatformAndState.split("|")[1];

    const outgoingParams = new URLSearchParams({
      code: incomingParams.get("code")?.toString() || "",
      state,
    });

    return res.redirect(
      APP_SCHEME + "/(auth)/signup" + "?" + outgoingParams.toString()
    );
  }

  public static async food(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<any> {
    let user = null;
    let goal = null;
    const redisUser = await redisService.get(`user:${req.user.id}`);
    if (redisUser) {
      user = JSON.parse(redisUser);
    } else {
      user = await User.findById(req.user.id)
        .select("weight height gender activityLevel healthCondition goal")
        .exec();
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      goal = await DailyGoal.findOne({
        userId: req.user.id,
      }).exec();
      if (!goal) {
        return res.status(404).json({ message: "User goals not found" });
      }
    }
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const foodPlan = await genFoodPlan(user, goal);
    console.log(foodPlan);

    return res.status(200).json(foodPlan);
  }

  public static async foodImage(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<any> {
    console.log("req.body", req.file);
    const image = req.file;
    if (!image) {
      return res.status(400).json({ message: "Image is required" });
    }
    // turn img multer memory to base64
    const base64Image = image.buffer.toString("base64");
    const food = await analyzeFoodImage(base64Image);
    return res.status(200).json(food);
  }

  public static async exercise(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<any> {
    try {
      const user = await User.findById(req.user.id)
        .select("weight height gender activityLevel healthCondition goal")
        .exec();

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const exercisePlan = await genExercisePlan(user);
      return res.status(200).json(exercisePlan);
    } catch (e) {
      console.error("Error generating exercise plan:", e);
      res.status(500).json({ message: "Internal server error" });
    }
  }
}

export default AuthController;

type googleUser = {
  email: string;
  given_name: string;
  family_name: string;
  picture: string;
  name: string;
};
