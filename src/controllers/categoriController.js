// Import model Categories từ thư mục models
const { Categories } = require('../models');

// Hàm lấy danh sách tất cả các danh mục
const danhSachcategories = async (req, res) => {
  try {
    const danhsach = await Categories.findAll(); // Lấy toàn bộ danh mục
    return res.status(200).json({
      success: true,
      message: "Lấy danh sách danh mục thành công",
      data: danhsach
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Hàm tạo mới một danh mục
const createdCategories = async (req, res) => {
  try {
    const { name } = req.body; // Lấy dữ liệu từ body
    const image = req.file?.path || null;
    // Kiểm tra nếu thiếu name hoặc image
    if (!name || !image) {
      return res.status(400).json({
        success: false,
        message: "Tên và hình ảnh không được để trống"
      });
    }

    const newCategory = await Categories.create({ name, image }); // Tạo mới danh mục

    return res.status(201).json({
      success: true,
      message: "Tạo danh mục thành công",
      data: newCategory
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Hàm lấy thông tin một danh mục theo ID
const getById = async (req, res) => {
  try {
    const { id } = req.params; // Lấy id từ URL

    const loaiSPID = await Categories.findByPk(id); // Tìm danh mục theo ID

    if (!loaiSPID) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy loại sản phẩm"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Lấy một danh mục thành công",
      data: loaiSPID
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Hàm cập nhật danh mục theo ID
const updatedcategories = async (req, res) => {
  try {
    const { id } = req.params;           // Lấy id từ URL
    const { name, image } = req.body;    // Lấy dữ liệu cần cập nhật

    // Kiểm tra danh mục có tồn tại không
    const loaiDMById = await Categories.findByPk(id);
    if (!loaiDMById) {
      return res.status(404).json({
        success: false,
        message: "Danh mục không tồn tại"
      });
    }

    // Cập nhật danh mục
    await Categories.update(
      { name, image },
      { where: { id } }
    );

    // Lấy lại dữ liệu mới sau khi cập nhật
    const updatedCategory = await Categories.findByPk(id);

    return res.status(200).json({
      success: true,
      message: "Cập nhật danh mục thành công",
      data: updatedCategory
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
const deleteCategories=async(req,res)=>{
    const{id}=req.params;
    const loaiDMById=await Categories.findByPk(id);
    if (!loaiDMById) {
      return res.status(404).json({
        success: false,
        message: "Danh mục không tồn tại"
      });
    }
    await Categories.destroy({
        where:{id}
    });
    return res.status(200).json({
        success:true,
        message:"xoa danh muc thanh cong"
    })
}
// Export các hàm controller để sử dụng ở nơi khác (router)
module.exports = {
  danhSachcategories,
  createdCategories,
  getById,
  updatedcategories,
  deleteCategories
};
