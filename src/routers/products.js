const {Router}= require('express');
const {upload} =require('../utils/cloudinary')
const {danhSachProducts,createProducts,updatedProduct,trangThaiSanPham}=require('../controllers/productController');
const loaiProductsRouter=Router();
loaiProductsRouter.get('/',danhSachProducts)
loaiProductsRouter.post('/',upload.array('url'),createProducts)
loaiProductsRouter.put('/:id',upload.array('url'),updatedProduct)
loaiProductsRouter.patch('/:id',trangThaiSanPham)
module.exports=loaiProductsRouter;
