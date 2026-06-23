import mongoose from "mongoose"
const documentSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    catagory: {
        type: String,
        enum:['Brochure','Form','Guide','Policy'],
        required:true
    },
    description: {
        type: String,
        required: true
    },
    file: {
        type: String,
        required: true
    },
    publicPath: {
        type: String,
        trim: true,
        index: true,
    },
    contentVersion: {
        type: Number,
        default: 1,
    },
    status: {
        type:String,
        default:"active"
    }
}, { timestamps: true })

const Documents = mongoose.model('Documents', documentSchema);
export default Documents;