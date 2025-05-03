const router=require("express").Router();
const {
    accountActivationAuth
}=require("../controllers/UserAuthController");
const {
    accountActivation
}=require("../controllers/EmailController");

router.post("/account-activation",accountActivationAuth,accountActivation);

module.exports=router;
