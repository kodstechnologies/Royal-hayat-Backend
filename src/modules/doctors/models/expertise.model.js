import mongoose from "mongoose";
const expertiseSchema=new mongoose.Schema({
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
    const Expertise=mongoose.model("Expertise",expertiseSchema);
    export default Expertise;