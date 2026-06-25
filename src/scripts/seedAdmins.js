import User from '../modules/auth/models/user.model.js';

const ADMINS = [
  {
    email: 'royalehayat.dev@gmail.com',
    password: 'admin@123',
  },

];

const seedAdmins = async () => {
  try {

    for (const admin of ADMINS) {

      const normalizedEmail = admin.email.toLowerCase();

      const existing = await User.findOne({
        email: normalizedEmail,
      });

      if (!existing) {

        await User.create({
          name: 'Royal Hayat Admin',
          email: normalizedEmail,
          password: admin.password,
          role: 'admin',
          isActive: true,
        });

        console.log(`✅ Created admin: ${normalizedEmail}`);

        continue;
      }

      let updated = false;

      if (existing.role !== 'admin') {
        existing.role = 'admin';
        updated = true;
      }

      if (existing.isActive !== true) {
        existing.isActive = true;
        updated = true;
      }

      if (updated) {
        await existing.save();
        console.log(`✅ Updated admin: ${normalizedEmail}`);
      } else {
        console.log(`ℹ️ Admin already exists: ${normalizedEmail}`);
      }
    }

    console.log('✅ Admin seeding completed');

  } catch (error) {

    console.error('❌ Admin seeding failed:', error.message);
  }
};

export default seedAdmins;