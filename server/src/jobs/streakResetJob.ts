import cron from "node-cron";
import User from "@/models/user";
import CompletedDay from "@/models/CompletedDay";
import { subDays, startOfDay, endOfDay } from "date-fns";

const TIMEZONE = "Asia/Ulaanbaatar";

// Main job: check and reset user streaks daily
const checkAndResetStreaks = async () => {
  const now = new Date();
  console.log(
    `Running streak reset job at: ${new Intl.DateTimeFormat("en-US", {
      timeZone: TIMEZONE,
      dateStyle: "full",
      timeStyle: "long",
    }).format(now)}`
  );

  try {
    const usersWithStreaks = await User.find({ streak: { $gt: 0 } })
      .select("+streak +lastStreakUpdate")
      .exec();

    const yesterday = subDays(now, 1);
    const startOfYesterday = startOfDay(yesterday);
    const endOfYesterday = endOfDay(yesterday);

    console.log(
      `Checking completions for: ${yesterday.toISOString().slice(0, 10)}`
    );

    for (const user of usersWithStreaks) {
      const completedYesterday = await CompletedDay.findOne({
        userId: user._id,
        date: { $gte: startOfYesterday, $lte: endOfYesterday },
      });

      if (!completedYesterday) {
        user.streak = 0;
        await user.save();
      }
    }

    console.log("✅ Streak reset job finished successfully.");
  } catch (error) {
    console.error("🚨 Error during streak reset job:", error);
  }
};

// Schedule the job to run daily at 00:05 Asia/Ulaanbaatar time
const scheduleStreakResetJob = () => {
  cron.schedule("5 0 * * *", checkAndResetStreaks, {
    timezone: TIMEZONE,
  });

  console.log(
    `🕐 Streak reset cron job scheduled daily at 00:05 (${TIMEZONE})`
  );
};

export { scheduleStreakResetJob, checkAndResetStreaks }; //mby for testing
