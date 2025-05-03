const router=require("express").Router();

//controllers
const {
    register,
    login
}=require("../controllers/UserController");

//middlewares
const {
    userAuthRegister,
    userAuthLogin
}=require("../controllers/UserAuthController");

//routes
router.post("/register",userAuthRegister,register);
router.post("/login",userAuthLogin,login);
 
//                   ****************END*****************

module.exports=router;