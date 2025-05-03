const mongoose=require("mongoose");

const TestModule=mongoose.Schema({
    moduleName:{
        type:String,
        required:true   
    },
    moduleData:[
     {   type:mongoose.Schema.Types.ObjectId,
        ref:'Test'}
    ],
    // user:{
    //     type:mongoose.Schema.Types.ObjectId,
    //     ref:"User"
    // },
    clerkId:{
        type:String,
        required:true
    },
    createdAt:{
        type:Date,
        default:Date.now
    },
    durationSeconds:{
        type:Number,
        default:300 // Default to 5 minutes (300 seconds)
    }
});

const TestModuleModel=mongoose.model("TestModule",TestModule);
module.exports=TestModuleModel;
