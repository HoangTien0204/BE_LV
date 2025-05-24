const {Router}= require('express');
const {danhSachProducts}=require('../controllers/productController');
const loaiProductsRouter=Router();
loaiProductsRouter.get('/',danhSachProducts)

module.exports=loaiProductsRouter;