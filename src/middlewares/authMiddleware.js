const jwt=require('jsonwebtoken')

const authMiddleware=(req,res,next)=>{
    try {
        const authorization=req.headers['authorization'];
        console.log(authorization);
        if(!authorization){
            return res.status(401).json({
                status:'false',
                message:'Authorization:no authorization header provided'
            })
        }
        const token =authorization.split(' ')[1];
        if(!token){
            return res.status(401).json({
                status:'false',
                message:'Unauthorized:Token not found'
            })
        }
        jwt.verify(token,'key',(err,users)=>{
            if(err){
                return res.status(401).json({
                    status:'false',
                    message:'Unauthorized:Invalid token'
                })
            }
            req.users=users;
            console.log(req.users);
                        next();
        })

    } catch (error) {
        return res.status(500).json({
            status:'false',
            message:'Internal server error'
        })
    }
}
module.exports=authMiddleware;