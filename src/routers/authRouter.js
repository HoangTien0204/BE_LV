const {Router}=require('express')
const{registerController,loginController,adminLoginController,LoginGoogle,forgotPasswordController,verifyOTP,resetPassword}=require('../controllers/authController')
const authRouter=Router()
authRouter.post('/register',registerController)
authRouter.post('/login',loginController)
authRouter.post('/adminlogin',adminLoginController)
authRouter.post('/google/callback',LoginGoogle)
authRouter.post('/forgot-password', forgotPasswordController);
authRouter.post('/verify-otp', verifyOTP);
authRouter.post('/reset-password', resetPassword);
module.exports=authRouter