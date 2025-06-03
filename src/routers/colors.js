const {Router}= require('express');
const {upload} =require('../utils/cloudinary')
const {danhSachColors,createdColors,getColorById,updatedColors,deleteColors}=require('../controllers/colorsController')
const loaiColorsRouter=Router();
loaiColorsRouter.get('/',danhSachColors)
 loaiColorsRouter.post('/',upload.single('code'),createdColors)
 loaiColorsRouter.get('/:id',getColorById)
 loaiColorsRouter.put('/:id',upload.single('code'),updatedColors)
 loaiColorsRouter.delete('/:id',deleteColors)
module.exports=loaiColorsRouter;
