const {Discount_codes} =require('../models');
// Hàm lấy danh sách tất cả các danh mục
const danhSachDiscount_codes = async (req, res) => {
    try {
        const danhsach=await Discount_codes.findAll();
        return res.status(200).json({
          success:true,
          message:"Lấy danh sách mã giảm giá thành công",
          data:danhsach,
        })
      } catch (error) {
        console.log(error); // Thêm dòng này để debug
        res.status(500).json({
          success:false,
          message:error.message
        })
}};
  
  module.exports={
    danhSachDiscount_codes
  }