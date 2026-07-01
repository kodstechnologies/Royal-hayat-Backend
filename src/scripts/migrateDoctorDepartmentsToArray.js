import dotenv from "dotenv";
import mongoose from "mongoose";

import connectDB from "../config/db.js";
import Doctor from "../modules/doctors/models/doctor.model.js";

dotenv.config();

async function migrateDoctorDepartmentsToArray() {
  await connectDB();

  const collection = mongoose.connection.collection("doctors");

  const topLevelType = (bsonType) => ({
    $expr: { $eq: [{ $type: "$department" }, bsonType] },
  });

  const [objectIdCount, nullCount, missingCount, alreadyArrayCount, otherCount] =
    await Promise.all([
      collection.countDocuments(topLevelType("objectId")),
      Doctor.countDocuments({ department: null }),
      Doctor.countDocuments({ department: { $exists: false } }),
      collection.countDocuments({
        $expr: {
          $and: [
            { $eq: [{ $type: "$department" }, "array"] },
            { $gt: [{ $size: "$department" }, 0] },
          ],
        },
      }),
      collection.countDocuments({
        $expr: {
          $and: [
            { $ne: [{ $type: "$department" }, "objectId"] },
            { $ne: [{ $type: "$department" }, "array"] },
            { $ne: ["$department", null] },
          ],
        },
      }),
    ]);

  console.log("Doctor department field audit (before migration):");
  console.log(`  single ObjectId: ${objectIdCount}`);
  console.log(`  already array:   ${alreadyArrayCount}`);
  console.log(`  null:            ${nullCount}`);
  console.log(`  missing:         ${missingCount}`);
  console.log(`  other type:      ${otherCount}`);

  const objectIdResult = await collection.updateMany(
    topLevelType("objectId"),
    [{ $set: { department: ["$department"] } }],
  );

  const nullResult = await collection.updateMany(
    {
      $or: [{ department: null }, { department: { $exists: false } }],
    },
    { $set: { department: [] } },
  );

  const stringObjectIdResult = await collection.updateMany(
    {
      department: {
        $type: "string",
        $regex: /^[0-9a-fA-F]{24}$/,
      },
    },
    [
      {
        $set: {
          department: [
            { $toObjectId: "$department" },
          ],
        },
      },
    ],
  );

  const [afterObjectId, afterArray, afterEmpty] = await Promise.all([
    collection.countDocuments(topLevelType("objectId")),
    collection.countDocuments({
      $expr: {
        $and: [
          { $eq: [{ $type: "$department" }, "array"] },
          { $gt: [{ $size: "$department" }, 0] },
        ],
      },
    }),
    collection.countDocuments({
      $or: [
        { department: null },
        { department: { $exists: false } },
        {
          $expr: {
            $and: [
              { $eq: [{ $type: "$department" }, "array"] },
              { $eq: [{ $size: "$department" }, 0] },
            ],
          },
        },
      ],
    }),
  ]);

  console.log("\nMigration results:");
  console.log(
    `  wrapped ObjectId → array: ${objectIdResult.modifiedCount} document(s)`,
  );
  console.log(
    `  null/missing → []:        ${nullResult.modifiedCount} document(s)`,
  );
  console.log(
    `  string ObjectId → array:  ${stringObjectIdResult.modifiedCount} document(s)`,
  );

  console.log("\nDoctor department field audit (after migration):");
  console.log(`  single ObjectId remaining: ${afterObjectId}`);
  console.log(`  non-empty arrays:          ${afterArray}`);
  console.log(`  empty / unset:             ${afterEmpty}`);

  if (afterObjectId > 0) {
    console.warn(
      "\n⚠️ Some doctors still have a single ObjectId department. Review manually.",
    );
  } else {
    console.log("\n✅ All doctor department fields are now arrays.");
  }
}

migrateDoctorDepartmentsToArray()
  .then(async () => {
    await mongoose.connection.close();
    process.exit(0);
  })
  .catch(async (error) => {
    console.error("Migration failed:", error);
    await mongoose.connection.close();
    process.exit(1);
  });
