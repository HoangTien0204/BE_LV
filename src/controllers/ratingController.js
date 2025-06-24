const {Ratings, Users, Orders, Products}=require('../models');

const danhSachRating=async(req,res)=>{
  try {
    const danhsach=await Ratings.findAll({
      include:['user','order','product']
    });
    return res.status(200).json({
      success: true,
      message: "Lấy danh sách Rating thành công",
      data: danhsach
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}
const themdanhgia = async (req, res) => {
  try {
    const { user_id, order_id, product_id, star_rating, comment } = req.body;

    // Kiểm tra các trường bắt buộc
    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: "user_id là bắt buộc"
      });
    }

    if (!order_id) {
      return res.status(400).json({
        success: false,
        message: "order_id là bắt buộc"
      });
    }

    if (!product_id) {
      return res.status(400).json({
        success: false,
        message: "product_id là bắt buộc"
      });
    }

    if (!star_rating) {
      return res.status(400).json({
        success: false,
        message: "star_rating là bắt buộc"
      });
    }

    // Kiểm tra định dạng star_rating (phải từ 1-5)
    if (star_rating < 1 || star_rating > 5 || !Number.isInteger(Number(star_rating))) {
      return res.status(400).json({
        success: false,
        message: "star_rating phải là số nguyên từ 1 đến 5"
      });
    }

    // Kiểm tra độ dài comment (nếu có)
    if (comment && comment.length > 500) {
      return res.status(400).json({
        success: false,
        message: "Comment không được vượt quá 500 ký tự"
      });
    }

    // Kiểm tra user có tồn tại không
    const userExists = await Users.findByPk(user_id);
    if (!userExists) {
      return res.status(404).json({
        success: false,
        message: "Người dùng không tồn tại"
      });
    }

    // Kiểm tra order có tồn tại không
    const orderExists = await Orders.findByPk(order_id);
    if (!orderExists) {
      return res.status(404).json({
        success: false,
        message: "Đơn hàng không tồn tại"
      });
    }

    // Kiểm tra product có tồn tại không
    const productExists = await Products.findByPk(product_id);
    if (!productExists) {
      return res.status(404).json({
        success: false,
        message: "Sản phẩm không tồn tại"
      });
    }

    // Kiểm tra order có thuộc về user không
    if (orderExists.user_id !== parseInt(user_id)) {
      return res.status(403).json({
        success: false,
        message: "Bạn chỉ có thể đánh giá đơn hàng của chính mình"
      });
    }

    // Kiểm tra trạng thái đơn hàng (chỉ cho phép đánh giá khi đơn hàng đã hoàn thành)
    if (orderExists.status !== 'Đã giao' ) {
      return res.status(400).json({
        success: false,
        message: "Chỉ có thể đánh giá khi đơn hàng đã hoàn thành hoặc đã giao"
      });
    }

    // Kiểm tra xem user đã đánh giá sản phẩm trong đơn hàng này chưa
    const existingRating = await Ratings.findOne({
      where: {
        user_id: user_id,
        order_id: order_id,
        product_id: product_id
      }
    });

    if (existingRating) {
      return res.status(409).json({
        success: false,
        message: "Bạn đã đánh giá sản phẩm này trong đơn hàng này rồi"
      });
    }

    // Tạo rating mới
    const ratingmoi = await Ratings.create({
      user_id,
      order_id,
      product_id,
      star_rating: parseInt(star_rating),
      comment: comment || null,
      is_approved: 0
    });

    return res.status(201).json({
      success: true,
      message: "Thêm đánh giá thành công",
      data: ratingmoi
    });
  } catch (error) {
    console.error('Lỗi khi thêm đánh giá:', error);
    res.status(500).json({
      success: false,
      message: "Lỗi server: " + error.message
    });
  }
}
const capnhattrangthaidanhgia = async (req, res) => {
  try {

    const { rating_id, is_approved } = req.body;
console.log(req.body)
    // Kiểm tra rating_id bắt buộc
    if (!rating_id) {
      return res.status(400).json({
        success: false,
        message: "rating_id là bắt buộc"
      });
    }

 

    // Tìm rating theo ID
    const rating = await Ratings.findByPk(rating_id);
    if (!rating) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đánh giá"
      });
    }

    // Kiểm tra trạng thái hiện tại của rating
    if (rating.is_approved === 1) {
      return res.status(409).json({
        success: false,
        message: "Đánh giá này đã được phê duyệt trước đó"
      });
    }

    // Cập nhật trạng thái
    const newStatus = is_approved !== undefined ? is_approved : 1;
    rating.is_approved = newStatus;
    await rating.save();

    const statusMessage = newStatus === 1 ? "phê duyệt" : "từ chối";
    
    return res.status(200).json({
      success: true,
      message: `Cập nhật trạng thái đánh giá thành công - ${statusMessage}`,
      data: {
        rating_id: rating.id,
        is_approved: rating.is_approved,
        updated_at: rating.updatedAt
      }
    });
  } catch (error) {
    console.error('Lỗi khi cập nhật trạng thái đánh giá:', error);
    res.status(500).json({
      success: false,
      message: "Lỗi server: " + error.message
    });
  }
}

module.exports = {
    danhSachRating,
    themdanhgia,
    capnhattrangthaidanhgia
}