import mongoose from "mongoose";
const qualificationsSchema=new mongoose.Schema({
        subHeading:{
            type:String,
         
            trim:true,
        },
        subHeadingAr:{
            type:String,
      
            trim:true,
        },
        points:[{
            type:String,
         
            trim:true,
        }], 
        pointsAr:[{
            type:String,
        
            trim:true,
        }],
       
    },{timestamps:true});
    const Qualifications=mongoose.model("Qualifications",qualificationsSchema);
    export default Qualifications;