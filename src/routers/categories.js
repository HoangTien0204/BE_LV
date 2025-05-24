const {Router}= require('express');
const {upload} =require('../utils/cloudinary')
const {danhSachcategories,createdCategories,getById,updatedcategories,deleteCategories}=require('../controllers/categoriController');
const loaiCategoriRouter=Router();
loaiCategoriRouter.get('/',danhSachcategories)
loaiCategoriRouter.post('/',upload.single('image'),createdCategories)
loaiCategoriRouter.get('/:id',getById)
loaiCategoriRouter.put('/:id',updatedcategories)
loaiCategoriRouter.delete('/:id',deleteCategories)
module.exports=loaiCategoriRouter;
