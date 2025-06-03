const { Products, Product_variants,Product_image, sequelize } = require('../models');
const product_image = require('../models/product_image');

const sizes = require('../models/sizes');
// Hàm lấy danh sách tất cả các danh mục
const danhSachProducts = async (req, res) => {
  try {
    const danhsach = await Products.findAll({
      include: ['category', 'brands', 'product_image', {
        model: Product_variants,
        as: 'product_variants',
        include: [
          'sizes',
          'colors'
        ]
      }]

    }); // Lấy toàn bộ danh mục
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
//them
const createProducts = async (req, res,next) => {

  const t = await sequelize.transaction();
  try {
    const { name, description, price, promotional, brand_id, category_id, is_active, variants } = req.body;
    const products = await Products.create({
      name,
      description,
      price,
      promotional,
      brand_id,
      category_id,
      is_active,
    }, { transaction: t });
    for(let variant of variants){
      const {color_id,size_id,stock_quantity}=variant;
      await  Product_variants.create({
        product_id:products.id,
        color_id,
        size_id,
        stock_quantity
      },{transaction:t});
    }
     // 3. Lưu hình ảnh (nếu có)
     if (req.files && req.files.length > 0) {
      for (let file of req.files) {
        await Product_image.create({
          product_id: products.id,
          url: file.path,
        }, { transaction: t });
      }
    }

    await t.commit();
    return res.status(201).json({
      success: true,
      message: "Tạo san pham thành công",
      data: products
    });
  } catch (error) {
    await t.rollback();
    next (error);
  }
}
const updatedProduct = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    const { name, description, price, promotional, brand_id, category_id, is_active, variants } = req.body;

    // 1. Cập nhật thông tin sản phẩm
    const product = await Products.findByPk(id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Sản phẩm không tồn tại" });
    }

    await product.update({
      name,
      description,
      price,
      promotional,
      brand_id,
      category_id,
      is_active,
    }, { transaction: t });

    await Product_variants.destroy({
      where: { product_id: id },
      transaction: t
    });
    // 3. Tạo variants mới
    for (let variant of variants) {
      const { color_id, size_id, stock_quantity } = variant;
      await Product_variants.create({
        product_id: id,
        color_id,
        size_id,
        stock_quantity
      }, { transaction: t });
    }

    // 4. Lưu ảnh mới nếu có
    if (req.files && req.files.length > 0) {
      await Product_image.destroy({
        where: { product_id: id },
        transaction: t
      });
      for (let file of req.files) {
        await Product_image.create({
          product_id: id,
          url: file.path,
        }, { transaction: t });
      }
    }

    await t.commit();
    return res.status(200).json({
      success: true,
      message: "Cập nhật sản phẩm thành công",
      data: product
    });
  } catch (error) {
    await t.rollback();
    next(error);
  }
};
const trangThaiSanPham=async(req,res)=>{
  try {
    const {id}=req.params
    const{is_active}=req.body
    const products= await Products.findByPk(id)
    if(!products){
      return res.status(404).json({
        status:'false',
        message:'san pham khong ton tai'
      })
    }
    await products.update({is_active})
    return res.status(200).json({
      status:true,
      message:'cap nhat thanh cong',
      data:products
    })

  } catch (error) {
    next(error)
  }
}
module.exports = {
  danhSachProducts,
  createProducts,
  updatedProduct,
  trangThaiSanPham
}
// const danhSachOrder = async (req, res) => {
//   try {
//       const danhsach = await Orders.findAll();
//       return res.status(200).json({
//           success: true,
//           message: "Lấy danh sách order thành công",
//           data: danhsach,
//       })
//   } catch (error) {
//       res.status(500).json({
//           success: false,
//           message: error.message
//       })
//   }
// };