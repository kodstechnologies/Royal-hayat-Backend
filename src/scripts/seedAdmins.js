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

      existing.role = 'admin';
      existing.isActive = true;

      existing.password = admin.password;

      await existing.save();

      console.log(`✅ Updated admin: ${normalizedEmail}`);
    }

    console.log('✅ Admin seeding completed');

  } catch (error) {

    console.error('❌ Admin seeding failed:', error.message);
  }
};

export default seedAdmins;