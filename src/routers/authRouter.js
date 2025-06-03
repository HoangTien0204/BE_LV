const {Router}=require('express')
const{registerController,loginController,adminLoginController}=require('../controllers/authController')
const authRouter=Router()
authRouter.post('/register',registerController)
authRouter.post('/login',loginController)
authRouter.post('/adminlogin',adminLoginController)
module.exports=authRouter