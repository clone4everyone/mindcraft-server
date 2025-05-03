const User=require("../models/UserModel");
const jwt=require("jsonwebtoken");
const {sendEmail}=require("../utils/sendMail");
const path=require("path");
const ejs=require("ejs");

// register
const register=async(req,res)=>{
try{
const token= jwt.sign(req.body,process.env.JWT_SECRET,{
    expiresIn:process.env.TOKEN_EXPIRE
});

const activationUrl=`${process.env.SERVER_URL}/api/v1/email/account-activation?token=${token}`
const data={
    user:{ name: req.body.username},
    activationUrl
}
const html = await ejs.renderFile(
    path.join(__dirname, "../emails/activation-email.ejs"),
    data
  );
await sendEmail({
    to:req.body.email,
    subject: "Activate your account",
     html
});

res.status(201).json({message:`We have Sent you an email on ${req.body.email},To register please verify.`});
}catch(err){
    console.log(err.message);
}
};

// login
const login=async()=>{
  const {email,password}=req.body;
    const isFound=await User.findOne({email:email.toLowerCase()});
    if(!isFound){
        return res.status(404).json({message:"Email not found"});
    }
    const isMatch=await isFound.comparePassword(password);
    if(!isMatch){
        return res.status(401).json({message:"Invalid credentials"});
    }
    const token=jwt.sign({id:isFound._id},process.env.JWT_SECRET,{
        expiresIn:process.env.TOKEN_EXPIRE
    });

    res.status(200).json({
        message:"Login Successfully",
        token,
        user:{
            _id:isFound._id,
            username:isFound.username,
            email:isFound.email
        }
    });
};

module.exports={
    register,
    login
}