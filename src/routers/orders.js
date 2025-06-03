const {Router}= require('express');
const {createOrder,vnpayReturn}=require('../controllers/orderController');
const loaiOrderRouter=Router();
loaiOrderRouter.get('/vnpay',vnpayReturn)
loaiOrderRouter.post('/',createOrder)
module.exports=loaiOrderRouter;