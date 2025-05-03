const { default: mongoose } = require("mongoose");
const mongoose=require("mongoose");

const Draft=mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    test:{
        user:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"Test"
        }
    }
});
Draft.index({user:1,test:1});
const DraftModel=new mongoose.model('Draft',Draft);

module.exports=DraftModel;