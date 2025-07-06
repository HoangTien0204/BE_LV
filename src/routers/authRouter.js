const {Router}=require('express')
const{registerController,loginController,adminLoginController,LoginGoogle}=require('../controllers/authController')
const authRouter=Router()
authRouter.post('/register',registerController)
authRouter.post('/login',loginController)
authRouter.post('/adminlogin',adminLoginController)
authRouter.post('/google/callback',LoginGoogle)
module.exports=authRouter