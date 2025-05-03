const User=require("../models/UserModel");
const jwt=require("jsonwebtoken");


const accountActivation=async(req,res)=>{
const {token}=req.query;
const userData=jwt.verify(token,process.env.JWT_SECRET);
if(!userData){
    return res.status(401).json({message:"Session expired, please register again"});
}
const isCreated=await User.Create(userData);
if(!isCreated){
    return res.status(409).json({message:"User already exist"});
}
if(isCreated){
    return res.redirect(`${process.env.USER_URL}/login`);
}

}

module.exports={
    accountActivation
}