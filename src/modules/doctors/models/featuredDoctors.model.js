import mongoose from 'mongoose';
const featuredDoctorsSchema=new mongoose.Schema({
    doctor:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Doctor',
        required:true
    }
})

const featuredDoctors = mongoose.model('Doctor', featuredDoctorsSchema);

export default featuredDoctors;