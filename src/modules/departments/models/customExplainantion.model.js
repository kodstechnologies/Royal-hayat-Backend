import mongoose from 'mongoose';

const customExplainantionSchema = new mongoose.Schema({
    subHeading: {
        type: String,
        trim: true,
    },
    explaination: [{
        type: String,
        trim: true,
    }],
}, { timestamps: true });
const CustomExplainantion = mongoose.model('CustomExplainantion', customExplainantionSchema);
export default CustomExplainantion;
