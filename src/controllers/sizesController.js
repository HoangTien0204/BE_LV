const {Sizes}=require('../models');
//lay danh sach tat ca cac size
const danhSachSizes =async(req,res)=>{
    try {
      const danhsach=await Sizes.findAll();
      return res.status(200).json({
        success:true,
        message:"Lấy danh sách size thành công",
        data:danhsach,
      })
    } catch (error) {
      res.status(500).json({
        success:false,
        message:error.message
      })
    }
  }
  //tao moi mot size
  const createSizes=async(req,res)=>{
    try {
        const {name}=req.body;
        if(!name){
            return res.status(400).json({
                success:false,
                message:"ten khong duoc de trong"
            })
        }
        const newSize=await Sizes.create({name});
        return res.status(201).json({
          success:true,
          message:"tao size thanh cong",
          data:newSize  
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
          });
    }
  }
  // Hàm lấy thông tin một danh mục theo ID
const getSizeById = async (req, res) => {
  try {
    const { id } = req.params; // Lấy id từ URL

    const loaiSPID = await Sizes.findByPk(id); // Tìm danh mục theo ID

    if (!loaiSPID) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy loại size"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Lấy một size thành công",
      data: loaiSPID
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
// Cập nhật thương hiệu
const updatedSize = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const size = await Sizes.findByPk(id);
    if (!size) {
      return res.status(404).json({
        success: false,
        message: "Size không tồn tại"
      });
    }

    size.name = name; // Cập nhật giá trị mới
    await size.save(); // Lưu vào database

    return res.status(200).json({
      success: true,
      message: "Cập nhật size thành công",
      data: size
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};



// Xóa size
const deleteSize = async (req, res) => {
  try {
    const { id } = req.params;
    const size = await Sizes.findByPk(id);
    if (!size) {
      return res.status(404).json({
        success: false,
        message: "size không tồn tại"
      });
    }

    await Sizes.destroy({ where: { id } });

    return res.status(200).json({
      success: true,
      message: "Xóa size thành công"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports={
    danhSachSizes,
    createSizes,
    getSizeById,
    updatedSize,
    deleteSize
};
