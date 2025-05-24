const {Products} =require('../models');
// Hàm lấy danh sách tất cả các danh mục
const danhSachProducts = async (req, res) => {
    try {
      const danhsach = await Products.findAll({include:['category','brands','product_image']}); // Lấy toàn bộ danh mục
      return res.status(200).json({
        success: true,
        message: "Lấy danh sách san pham thành công",
        data: danhsach
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  };
  module.exports={
    danhSachProducts
  }