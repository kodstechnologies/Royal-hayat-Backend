import dotenv from "dotenv";
import mongoose from "mongoose";

import connectDB from "../config/db.js";
import Achievement from "../modules/achievements/models/achievemnt.model.js";

dotenv.config();

async function backfillAchievementTypeMonth() {
  await connectDB();

  const missingFilter = {
    $or: [
      { achievementType: { $exists: false } },
      { achievementType: null },
      { achievementType: "" },
    ],
  };

  const missingCount = await Achievement.countDocuments(missingFilter);
  console.log(`Achievements missing type before migration: ${missingCount}`);

  const result = await Achievement.updateMany(missingFilter, {
    $set: { achievementType: "month" },
  });

  const remainingCount = await Achievement.countDocuments(missingFilter);

  console.log(`Updated documents: ${result.modifiedCount}`);
  console.log(`Remaining missing after migration: ${remainingCount}`);

  if (remainingCount === 0) {
    console.log('Migration complete: achievementType is set to "month".');
  } else {
    console.warn("Some records still need manual review.");
  }
}

backfillAchievementTypeMonth()
  .then(async () => {
    await mongoose.connection.close();
    process.exit(0);
  })
  .catch(async (error) => {
    console.error("Migration failed:", error);
    await mongoose.connection.close();
    process.exit(1);
  });
