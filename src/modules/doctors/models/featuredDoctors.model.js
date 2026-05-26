import mongoose from 'mongoose';
const featuredDoctorsSchema=new mongoose.Schema({
    doctor:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Doctor',
        required:true
    }
})

const FeaturedDoctor = mongoose.model('FeaturedDoctor', featuredDoctorsSchema);

export default FeaturedDoctor;