import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../modules/auth/models/user.model.js';

dotenv.config();

const ADMIN_EMAILS = [
  'royahhayat@gmail.com',
  'prajwalanagekar@gmail.com',
];

const DEFAULT_ADMIN_PASSWORD = process.env.ADMIN_SEED_PASSWORD || 'Admin@123';

const connectDB = async () => {
  await mongoose.connect(process.env.MONGODB_URI, {
    dbName: process.env.DB_NAME,
  });
};

const seedAdmins = async () => {
  await connectDB();

  for (const email of ADMIN_EMAILS) {
    const normalizedEmail = email.toLowerCase();
    const existing = await User.findOne({ email: normalizedEmail });

    if (!existing) {
      await User.create({
        name: 'Royal Hayat Admin',
        email: normalizedEmail,
        password: DEFAULT_ADMIN_PASSWORD,
        role: 'admin',
        isActive: true,
      });
      console.log(`Created admin: ${normalizedEmail}`);
      continue;
    }

    existing.role = 'admin';
    existing.isActive = true;
    await existing.save();
    console.log(`Updated admin role: ${normalizedEmail}`);
  }
};

seedAdmins()
  .then(async () => {
    console.log('Admin seeding completed');
    await mongoose.connection.close();
    process.exit(0);
  })
  .catch(async (error) => {
    console.error('Admin seeding failed:', error.message);
    await mongoose.connection.close();
    process.exit(1);
  });
