import dotenv from "dotenv";
import mongoose from "mongoose";

import connectDB from "../config/db.js";
import Catagory from "../modules/catagory/model/catagory.model.js";

dotenv.config();

const CATEGORIES = [
  {
    name: "CLINICAL SPECIALITY",
    arabicName: "التخصصات السريرية",
  },
  {
    name: "CLINICAL SUPPORT SERVICE",
    arabicName: "خدمات الدعم السريري",
  },
  {
    name: "HOME CARE SERVICE",
    arabicName: "خدمات الرعاية المنزلية",
  },
];

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const findExistingCategory = async (cat) => {
  return Catagory.findOne({
    $or: [
      { arabicName: cat.arabicName },
      { name: cat.name },
      { name: { $regex: new RegExp(`^${escapeRegex(cat.name)}$`, "i") } },
    ],
  });
};

const seedCategories = async () => {
  await connectDB();

  let created = 0;
  let updated = 0;

  try {
    for (const cat of CATEGORIES) {
      const existing = await findExistingCategory(cat);

      if (existing) {
        existing.name = cat.name;
        existing.arabicName = cat.arabicName;
        await existing.save();
        updated += 1;
        console.log(`✅ Updated category: ${cat.name}`);
      } else {
        await Catagory.create({
          name: cat.name,
          arabicName: cat.arabicName,
        });
        created += 1;
        console.log(`✅ Created category: ${cat.name}`);
      }
    }

    console.log(
      `\n✅ Category seeding completed (${created} created, ${updated} updated)`,
    );
  } catch (error) {
    console.error("❌ Category seeding failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
};

seedCategories();
