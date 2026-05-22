import app from './app.js';
import connectDB from './config/db.js';
import seedAdmins from './scripts/seedAdmins.js';

const PORT = process.env.PORT || 5000;

connectDB()
  .then(async () => {

    // Run Admin Seeder
    await seedAdmins();

    app.listen(PORT, () => {
      console.log(`Royal Hayatt server running on http://localhost:${PORT}`);
    });

  })
  .catch((error) => {
    console.error('DB Connection Failed:', error.message);
  });