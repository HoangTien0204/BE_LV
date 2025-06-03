const {Router}= require('express');
const {upload} =require('../utils/cloudinary')
const authMiddleware=require('../middlewares/authMiddleware')
const {validatorMiddleware}=require('../middlewares/validatorMiddleware')
const {danhSachcategories,createdCategories,getById,updatedcategories,deleteCategories,trangThaiDanhMuc}=require('../controllers/categoriController');
const loaiCategoriRouter=Router();
loaiCategoriRouter.get('/',danhSachcategories)
loaiCategoriRouter.post('/',upload.single('image'),createdCategories)
loaiCategoriRouter.get('/:id',getById)
loaiCategoriRouter.put('/:id',updatedcategories)
loaiCategoriRouter.delete('/:id',deleteCategories)
loaiCategoriRouter.patch('/:id',trangThaiDanhMuc)
module.exports=loaiCategoriRouter;
