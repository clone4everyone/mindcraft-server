
const mongoose = require("mongoose");

const Test = mongoose.Schema({
    question: {
        type: String,
        required: true
    },
    options: [
        {
            type: String,
            required: true
        }
    ],
    level: {
        type: String,
        required: true
    },
    previousUsage: {
        type: String,
    },
    answer: {
        type: String
    },
    clerkId: {
        type: String,
        required: true
    }
    // user:{
    //     type:mongoose.Schema.Types.ObjectId,
    //     ref:"User"
    // },
   
});

const TestModel = new mongoose.model("Test", Test);
module.exports = TestModel;