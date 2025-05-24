const {Router}= require('express');
const {upload} =require('../utils/cloudinary')
const {danhSachBrands, createdBrands,getBrandById,updatedBrands,deleteBrands}=require('../controllers/brandsController')
const loaiBrandsRouter=Router();
loaiBrandsRouter.get('/',danhSachBrands)
loaiBrandsRouter.post('/',upload.single('image'),createdBrands)
loaiBrandsRouter.get('/:id',getBrandById)
loaiBrandsRouter.put('/:id',upload.single('image'),updatedBrands)
loaiBrandsRouter.delete('/:id',deleteBrands)
module.exports=loaiBrandsRouter;
