
const { Colors } = require('../models');
const danhSachColors =async(req,res)=>{
    try {
      const danhsach=await Colors.findAll();
      return res.status(200).json({
        success:true,
        message:"Lấy danh sách mau thành công",
        data:danhsach,
      })
    } catch (error) {
      res.status(500).json({
        success:false,
        message:error.message
      })
    }
  }
  // Tạo mới 
const createdColors = async (req, res) => {
    try {
      const { name } = req.body;
      const code = req.file?.path || null;
  
      if (!name || !code) {
        return res.status(400).json({
          success: false,
          message: "Tên và hình ảnh không được để trống"
        });
      }
  
      const newColors = await Colors.create({ name, code });
  
      return res.status(201).json({
        success: true,
        message: "Tạo thương hiệu thành công",
        data: newColors
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  };
  // Lấy color theo ID
  const getColorById = async (req, res) => {
    try {
      const { id } = req.params;
      const colors = await Colors.findByPk(id);
  
      if (!colors) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy color"
        });
      }
  
      return res.status(200).json({
        success: true,
        message: "Lấy color thành công",
        data: colors
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  };
  
  // Cập nhật thương hiệu
  const updatedColors = async (req, res) => {
    try {
      const { id } = req.params;
      const { name } = req.body;
  
      const colors = await Colors.findByPk(id);
      if (!colors) {
        return res.status(404).json({
          success: false,
          message: "color không tồn tại"
        });
      }
  
      // Nếu không có file upload mới, giữ nguyên ảnh cũ
      const code = req.file?.path || colors.code;
  
      await Colors.update({ name, code }, { where: { id } });
      const updated = await Colors.findByPk(id);
  
      return res.status(200).json({
        success: true,
        message: "Cập nhật color thành công",
        data: updated
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  };
  
  
  // Xóa color
  const deleteColors = async (req, res) => {
    try {
      const { id } = req.params;
      const colors = await Colors.findByPk(id);
      if (!colors) {
        return res.status(404).json({
          success: false,
          message: "color không tồn tại"
        });
      }
  
      await Colors.destroy({ where: { id } });
  
      return res.status(200).json({
        success: true,
        message: "Xóa color thành công"
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  };
  module.exports={
danhSachColors,
createdColors,
getColorById,
updatedColors,
deleteColors
  }