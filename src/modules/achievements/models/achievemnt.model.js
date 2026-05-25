import mongoose from 'mongoose';

const achievementSchema = new mongoose.Schema({

})


const Achievement = mongoose.model(
  'Achievement',
  achievementSchema,
);

export default Achievement;