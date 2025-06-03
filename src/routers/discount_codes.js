const {Router}= require('express');
const {danhSachDiscount_codes}=require('../controllers/discount_codesController');
const loaiDiscount_code=Router();
loaiDiscount_code.get('/',danhSachDiscount_codes)

module.exports=loaiDiscount_code 