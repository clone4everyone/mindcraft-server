const User=require("../models/UserModel");
const jwt=require("jsonwebtoken");

const userAuth=async(req,res)=>{
    const {token}=req.headers.authorization.split(" ")[1];
    if(!token){
        return res.status(401).json({message:"Unauthorized"});
    }
    next();
}

const userAuthRegister=async(req,res,next)=>{
    try{
        const {email,username}=req.body;
        if(!username){
          return res.status(400).json({message:"Username Required"});
        }
        const isFound=await User.findOne({email:email.toLowerCase()});
        if(isFound){
            return res.status(409).json({message:"Email already exist"});
        }
        
        next();
    }catch(err){
        console.log(err.message)
    }

}

const userAuthLogin=async(req,res,next)=>{
    try{
        const {email}=req.body;
        const isFound=await User.findOne({email:email.toLowerCase()});
        if(!isFound){
            return res.status(404).json({message:"Email not found"});
        }
        next();
    }catch(err){
        console.log(err.message)
    }
}

const accountActivationAuth=async(req,res)=>{
    try{
      const token=req.query.token;
      if( !jwt.verify(token,process.env.JWT_SECRET)){
        return res.status(401).json("Session expire, register again");
      }
      next(); 
    }catch(err){
        console.log(err.message);
    }
}

module.exports={
    userAuthRegister,
    userAuthLogin,
    accountActivationAuth,
    userAuth
}