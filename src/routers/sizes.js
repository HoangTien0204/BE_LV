const {Router}= require('express');
//const {upload} =require('../utils/cloudinary')
const {danhSachSizes,createSizes,getSizeById,updatedSize,deleteSize}=require('../controllers/sizesController')
const loaiSizesRouter=Router();
loaiSizesRouter.get('/',danhSachSizes)
loaiSizesRouter.post('/',createSizes)
loaiSizesRouter.get('/:id',getSizeById)
loaiSizesRouter.put('/:id',updatedSize)
loaiSizesRouter.delete('/:id',deleteSize)
module.exports=loaiSizesRouter;

