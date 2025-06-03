const {Router}= require('express');
const {upload} =require('../utils/cloudinary')
const authMiddleware=require('../middlewares/authMiddleware')
const {danhSachBrands, createdBrands,getBrandById,updatedBrands,deleteBrands,trangThaiBrand}=require('../controllers/brandsController')
const {createBrandSchema,updateBrandSchema}=require('../validations/brandSchema')
const {validatorMiddleware}=require('../middlewares/validatorMiddleware')
const loaiBrandsRouter=Router();
loaiBrandsRouter.get('/',danhSachBrands)
loaiBrandsRouter.post(
    '/',
    authMiddleware,
    upload.single('image'),
    validatorMiddleware(createBrandSchema),
    createdBrands
  );
loaiBrandsRouter.get('/:id',getBrandById)
loaiBrandsRouter.put(
    '/:id',
    authMiddleware,
    upload.single('image'),
    validatorMiddleware(updateBrandSchema),
    updatedBrands
  );
loaiBrandsRouter.delete('/:id',deleteBrands)
loaiBrandsRouter.patch('/:id',trangThaiBrand)
module.exports=loaiBrandsRouter;
