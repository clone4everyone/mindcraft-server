
const mongoose=require("mongoose");

const User=mongoose.Schema({
   
    email:{
        type:String,
        required:true
    },
    premium:{
        type:Boolean,
        default:false
    },
    clerkId:{
        type:String,
        required:true
    }
});

const UserModel=new mongoose.model('User',User);
module.exports=UserModel;