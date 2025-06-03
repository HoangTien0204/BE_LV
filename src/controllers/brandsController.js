const { Brands } = require('../models');

// Lấy danh sách tất cả các thương hiệu

const danhSachBrands =async(req,res)=>{
  try {
    const danhsach=await Brands.findAll();
    return res.status(200).json({
      success:true,
      message:"Lấy danh sách thương hiệu thành công",
      data:danhsach,
    })
  } catch (error) {
    res.status(500).json({
      success:false,
      message:error.message
    })
  }
}
// Tạo mới thương hiệu
const createdBrands = async (req, res) => {
  try {
    const { name } = req.body;
    const image = req.file?.path || null;
    const existingBrand = await Brands.findOne({ where: { name } });
    if (existingBrand) {
      return res.status(400).json({ message: 'Tên thương hiệu đã tồn tại' });
    }
    const newBrand = await Brands.create({ name, image });
    return res.status(201).json({
      success: true,
      message: "Tạo thương hiệu thành công",
      data: newBrand
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Lấy thương hiệu theo ID
const getBrandById = async (req, res) => {
  try {
    const { id } = req.params;
    const brand = await Brands.findByPk(id);

    if (!brand) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy thương hiệu"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Lấy thương hiệu thành công",
      data: brand
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Cập nhật thương hiệu
const updatedBrands = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const brand = await Brands.findByPk(id);
    if (!brand) {
      return res.status(404).json({
        success: false,
        message: "Thương hiệu không tồn tại"
      });
    }

    // Nếu không có file upload mới, giữ nguyên ảnh cũ
    const image = req.file?.path || brand.image;

    await Brands.update({ name, image }, { where: { id } });
    const updated = await Brands.findByPk(id);

    return res.status(200).json({
      success: true,
      message: "Cập nhật thương hiệu thành công",
      data: updated
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// Xóa thương hiệu
const deleteBrands = async (req, res) => {
  try {
    const { id } = req.params;
    const brand = await Brands.findByPk(id);
    if (!brand) {
      return res.status(404).json({
        success: false,
        message: "Thương hiệu không tồn tại"
      });
    }

    await Brands.destroy({ where: { id } });

    return res.status(200).json({
      success: true,
      message: "Xóa thương hiệu thành công"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
const trangThaiBrand = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { is_active } = req.body;

    const [affectedRows] = await Brands.update(
      { is_active },
      { where: { id } }
    );

    if (affectedRows === 0) {
      return res.status(404).json({
        status: 'false',
        message: 'Thương hiệu không tồn tại',
      });
    }

    const updatedBrand = await Brands.findByPk(id);

    return res.status(200).json({
      status: true,
      message: 'Cập nhật trạng thái thương hiệu thành công',
      data: updatedBrand,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  danhSachBrands,
  createdBrands,
  getBrandById,
  updatedBrands,
  deleteBrands,
  trangThaiBrand
};
