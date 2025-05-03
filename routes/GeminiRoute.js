const router=require("express").Router();

const {userAuth} = require("../controllers/UserAuthController");
const {GeminiCreate,getUserTests,getTestById} = require("../controllers/Test.Create.Controller");

router.post("/create", GeminiCreate);
router.post("/getUserTests",getUserTests)
router.post("/getTestById",getTestById)
module.exports=router;