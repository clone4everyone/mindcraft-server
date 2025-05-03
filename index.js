const express=require("express");
const app=express();
const cors=require("cors");
const mongoose=require("mongoose");
const UserRoute=require("./routes/UserRoutes");
const EmailRoute=require("./routes/EmailRoutes");
const GeminiRoute=require("./routes/GeminiRoute");
require("dotenv").config();

app.use(cors());
app.use(express.json());
app.use('/api/v1/auth',UserRoute)
app.use('/api/v1/email',EmailRoute)
app.use("/api/v1/gemini",GeminiRoute);

app.get("/", (req, res) => {
    console.log("Server is running");
    res.send("Hello from the server!");
});



app.listen(process.env.PORT,()=>{
    console.log(`${process.env.PORT}`)
})

const connectDB=()=>{
   return new Promise((resolve,reject)=>{
mongoose.connect(`${process.env.MONGO_URL}`).then(()=>resolve("successfull")).catch((err)=>reject(err.message));

})
}
connectDB().then(()=>{
    console.log("DB connect Successfully");
}).catch((err)=>{
    console.log(err.message);
});