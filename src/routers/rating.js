const {Router}= require('express');

const {danhSachRating,themdanhgia, capnhattrangthaidanhgia}=require('../controllers/RatingController')
const loaiRatingRouter=Router();
loaiRatingRouter.get('/',danhSachRating)
loaiRatingRouter.post('/',themdanhgia)
loaiRatingRouter.patch('/',capnhattrangthaidanhgia)

module.exports=loaiRatingRouter;

