import express from "express";
import {
  addCompletedDay,
  getCompletedDaysForMonth,
} from "../controllers/completedDayController";
import { authenticate } from "@/controllers/token"; // Corrected auth middleware path

const router = express.Router();

// POST /api/v1/users/completed-days - userId will be taken from authenticated user (req.user.id)
router.post("/completed-days", authenticate, addCompletedDay);

// GET /api/v1/users/completed-days?month=YYYY-MM - userId will be taken from authenticated user
router.get("/completed-days", authenticate, getCompletedDaysForMonth);

export default router;
