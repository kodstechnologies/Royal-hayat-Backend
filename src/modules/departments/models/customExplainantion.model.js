import mongoose from 'mongoose';

const customExplainantionSchema =
    new mongoose.Schema(
        {
            // ENGLISH
            subHeading: {
                type: String,
                trim: true,
            },

            explaination: [
                {
                    type: String,
                    trim: true,
                },
            ],

            // ARABIC
            arabicSubHeading: {
                type: String,
                trim: true,
            },

            arabicExplaination: [
                {
                    type: String,
                    trim: true,
                },
            ],
        },
        {
            timestamps: true,
        }
    );

const CustomExplainantion =
    mongoose.model(
        'CustomExplainantion',
        customExplainantionSchema
    );

export default CustomExplainantion;