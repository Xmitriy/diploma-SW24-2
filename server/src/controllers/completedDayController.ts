import { Response } from "express";
import CompletedDay from "@/models/CompletedDay";
import User from "@/models/user"; // Corrected import casing
import mongoose from "mongoose";
import { AuthenticatedRequest } from "./token";

export const addCompletedDay = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user.id;
    const { date } = req.body; // Expecting date in 'YYYY-MM-DD' format string

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      res.status(400).json({ message: "Invalid user ID format." });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: "User not found." });
      return;
    }

    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      res
        .status(400)
        .json({ message: "Invalid date format. Please use YYYY-MM-DD." });
      return;
    }

    const targetDate = new Date(date + "T00:00:00.000Z");

    const existingEntry = await CompletedDay.findOne({
      userId,
      date: targetDate,
    });
    if (existingEntry) {
      res.status(200).json({
        message: "Day already marked as completed.",
        completedDay: existingEntry,
      });
      return;
    }

    const newCompletedDay = new CompletedDay({
      userId,
      date: targetDate,
    });

    await newCompletedDay.save();
    res.status(201).json({
      message: "Day marked as completed successfully.",
      completedDay: newCompletedDay,
    });
  } catch (error) {
    console.error("Error adding completed day:", error);
    if (error instanceof Error) {
      res.status(500).json({
        message: "Server error adding completed day.",
        error: error.message,
      });
      return;
    }
    res.status(500).json({ message: "Server error adding completed day." });
  }
};

export const getCompletedDaysForMonth = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user.id; // Direct access
    const { month } = req.query; // Expecting month in 'YYYY-MM' format string

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      res.status(400).json({ message: "Invalid user ID format." });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: "User not found." });
      return;
    }

    if (!month || !/^\d{4}-\d{2}$/.test(month as string)) {
      res
        .status(400)
        .json({ message: "Invalid month format. Please use YYYY-MM." });
      return;
    }

    const [year, monthIndex] = (month as string).split("-").map(Number);
    const startDate = new Date(Date.UTC(year, monthIndex - 1, 1, 0, 0, 0));
    const endDate = new Date(Date.UTC(year, monthIndex, 0, 23, 59, 59, 999));

    const completedDays = await CompletedDay.find({
      userId,
      date: {
        $gte: startDate,
        $lte: endDate,
      },
    }).sort({ date: "asc" });

    const completedDayNumbers = completedDays.map((cd) =>
      new Date(cd.date).getUTCDate()
    );

    res.status(200).json({ completedDayNumbers });
  } catch (error) {
    console.error("Error fetching completed days:", error);
    if (error instanceof Error) {
      res.status(500).json({
        message: "Server error fetching completed days.",
        error: error.message,
      });
      return;
    }
    res.status(500).json({ message: "Server error fetching completed days." });
  }
};
