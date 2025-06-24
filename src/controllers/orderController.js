// Import các thư viện cần thiết
const crypto = require('crypto'); // Thư viện mã hóa để tạo chữ ký VNPAY
const moment = require('moment'); // Thư viện xử lý thời gian
const qs = require('qs'); // Thư viện xử lý query string
const { Orders_detail, Orders, Product_variants, sequelize } = require('../models'); // Import các model từ database

// Cấu hình VNPAY
const VNPAY = {
    tmnCode: 'Y23UTK8D', // Mã terminal của merchant được VNPAY cấp
    hashSecret: 'ZQ7X0L2ETEVQ8WQJRAT3B15TNEO7XMXT', // Khóa bí mật để tạo chữ ký
    url: 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html', // URL thanh toán VNPAY sandbox
    returnUrl: 'http://localhost:3000/api/vnpay/return', // URL callback sau khi thanh toán
};

// Lưu trữ tạm thời các đơn hàng chờ thanh toán (production nên dùng Redis)
const pendingOrders = new Map(); // Map để lưu thông tin đơn hàng chờ thanh toán VNPAY

// Các hàm helper
/**
 * Kiểm tra tồn kho của các sản phẩm trong đơn hàng
 * @param {Array} items - Danh sách sản phẩm cần kiểm tra
 * @param {Transaction} transaction - Transaction database
 */
const validateStock = async (items, transaction) => {
    // Duyệt qua từng sản phẩm trong đơn hàng
    for (const item of items) {
        // Tìm thông tin variant sản phẩm theo ID
        const variant = await Product_variants.findByPk(item.product_variant_id, { transaction });
        // Kiểm tra sản phẩm có tồn tại không
        if (!variant) {
            throw new Error(`Không tìm thấy sản phẩm với ID: ${item.product_variant_id}`);
        }
        // Kiểm tra số lượng tồn kho có đủ không
        if (variant.stock_quantity < item.quantity) {
            throw new Error(`Sản phẩm ID ${item.product_variant_id} không đủ số lượng. Còn lại: ${variant.stock_quantity}, yêu cầu: ${item.quantity}`);
        }
    }
};

/**
 * Trừ số lượng tồn kho của các sản phẩm
 * @param {Array} items - Danh sách sản phẩm cần trừ tồn kho
 * @param {Transaction} transaction - Transaction database
 */
const decrementStock = async (items, transaction) => {
    // Sử dụng Promise.all để trừ tồn kho song song, tăng hiệu suất
    await Promise.all(items.map(item => 
        // Giảm số lượng tồn kho của từng variant
        Product_variants.decrement('stock_quantity', {
            by: item.quantity, // Số lượng cần trừ
            where: { id: item.product_variant_id }, // Điều kiện: ID variant
            transaction // Thực hiện trong transaction
        })
    ));
};

/**
 * Tạo bản ghi đơn hàng và chi tiết đơn hàng
 * @param {string} orderId - ID đơn hàng
 * @param {Object} orderData - Dữ liệu đơn hàng
 * @param {Array} items - Danh sách sản phẩm
 * @param {string} status - Trạng thái đơn hàng
 * @param {Transaction} transaction - Transaction database
 * @param {Object} extraFields - Các trường bổ sung (payment_date, vnpay_transaction_id...)
 * @returns {Object} - Đơn hàng đã tạo
 */
const createOrderRecord = async (orderId, orderData, items, status, transaction, extraFields = {}) => {
    // Tạo bản ghi đơn hàng chính
    const order = await Orders.create({
        id: orderId, // ID đơn hàng
        ...orderData, // Spread dữ liệu đơn hàng (user_id, name, address...)
        status, // Trạng thái đơn hàng
        ...extraFields // Spread các trường bổ sung
    }, { transaction });

    // Tạo chi tiết đơn hàng (bulk insert để tăng hiệu suất)
    await Orders_detail.bulkCreate(
        items.map(item => ({ order_id: orderId, ...item })), // Thêm order_id vào mỗi item
        { transaction }
    );

    return order; // Trả về đơn hàng đã tạo
};

// Các hàm tiện ích
/**
 * Sắp xếp object theo key và encode URI
 * @param {Object} obj - Object cần sắp xếp
 * @returns {Object} - Object đã sắp xếp và encode
 */
const sortObject = (obj) => {
    const sorted = {}; // Object kết quả
    // Sắp xếp các key theo thứ tự alphabet
    Object.keys(obj).sort().forEach(key => {
        // Encode key và value, thay %20 bằng + (theo yêu cầu VNPAY)
        sorted[encodeURIComponent(key)] = encodeURIComponent(obj[key]).replace(/%20/g, '+');
    });
    return sorted;
};

/**
 * Tạo chữ ký HMAC SHA512 cho VNPAY
 * @param {string} data - Dữ liệu cần ký
 * @returns {string} - Chữ ký hex
 */
const createSignature = (data) => {
    // Tạo HMAC SHA512 với secret key của VNPAY
    return crypto.createHmac('sha512', VNPAY.hashSecret)
        .update(Buffer.from(data, 'utf-8')) // Convert string thành buffer UTF-8
        .digest('hex'); // Xuất ra dạng hex string
};

/**
 * Lấy IP của client
 * @param {Object} req - Request object
 * @returns {string} - IP address
 */
const getClientIP = (req) => {
    // Ưu tiên lấy IP từ header x-forwarded-for (khi có proxy/load balancer)
    // Nếu không có thì lấy từ connection.remoteAddress
    // Cuối cùng fallback về localhost
    return req.headers['x-forwarded-for'] || req.connection.remoteAddress || '127.0.0.1';
};

/**
 * Tạo URL thanh toán VNPAY
 * @param {string} orderId - ID đơn hàng
 * @param {number} amount - Số tiền (VND)
 * @param {string} ipAddr - IP address của client
 * @returns {string} - URL thanh toán VNPAY
 */
const createVNPayUrl = (orderId, amount, ipAddr) => {
    // Tạo các tham số theo spec của VNPAY
    let params = {
        vnp_Version: '2.1.0', // Phiên bản API VNPAY
        vnp_Command: 'pay', // Lệnh thanh toán
        vnp_TmnCode: VNPAY.tmnCode, // Mã terminal
        vnp_Locale: 'vn', // Ngôn ngữ (tiếng Việt)
        vnp_CurrCode: 'VND', // Đơn vị tiền tệ
        vnp_TxnRef: orderId, // Mã giao dịch (order ID)
        vnp_OrderInfo: `Thanh toan don hang ${orderId}`, // Thông tin đơn hàng
        vnp_OrderType: 'other', // Loại đơn hàng
        vnp_Amount: amount * 100, // Số tiền (VNPAY yêu cầu nhân 100)
        vnp_ReturnUrl: VNPAY.returnUrl, // URL callback
        vnp_IpAddr: ipAddr, // IP của client
        vnp_CreateDate: moment().format('YYYYMMDDHHmmss'), // Thời gian tạo
    };

    // Sắp xếp tham số theo alphabet (yêu cầu của VNPAY)
    params = sortObject(params);
    // Tạo chuỗi để ký
    const signData = qs.stringify(params, { encode: false });
    // Tạo chữ ký và thêm vào params
    params.vnp_SecureHash = createSignature(signData);
    
    // Trả về URL hoàn chỉnh
    return `${VNPAY.url}?${qs.stringify(params, { encode: false })}`;
};

/**
 * Xử lý thanh toán COD (Cash on Delivery)
 * @param {string} orderId - ID đơn hàng
 * @param {Object} orderData - Dữ liệu đơn hàng
 * @param {Array} items - Danh sách sản phẩm
 * @param {Object} res - Response object
 */
const handleCODPayment = async (orderId, orderData, items, res) => {
    // Bắt đầu transaction để đảm bảo tính nhất quán dữ liệu
    const t = await sequelize.transaction();
    try {
        // Kiểm tra tồn kho trước khi tạo đơn hàng
        await validateStock(items, t);
        
        // Tạo đơn hàng với trạng thái 'Pending'
        const order = await createOrderRecord(orderId, orderData, items, 'Pending', t);
        // Trừ số lượng tồn kho
        await decrementStock(items, t);
        
        // Commit transaction nếu mọi thứ thành công
        await t.commit();
        return res.json({ success: true, message: 'Đặt hàng thành công', data: order });
    } catch (error) {
        // Rollback transaction nếu có lỗi
        await t.rollback();
        throw error;
    }
};

/**
 * Xử lý thanh toán VNPAY
 * @param {string} orderId - ID đơn hàng
 * @param {Object} orderData - Dữ liệu đơn hàng
 * @param {Array} items - Danh sách sản phẩm
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const handleVNPayPayment = async (orderId, orderData, items, req, res) => {
    // Bắt đầu transaction để kiểm tra tồn kho
    const t = await sequelize.transaction();
    try {
        // Kiểm tra tồn kho trước khi tạo URL thanh toán
        await validateStock(items, t);
        await t.commit(); // Commit sau khi kiểm tra xong

        // Lưu thông tin đơn hàng tạm thời (chưa tạo đơn hàng thật)
        pendingOrders.set(orderId, { ...orderData, items, created_at: Date.now() });
        // Tự động xóa đơn hàng sau 15 phút nếu không thanh toán
        setTimeout(() => pendingOrders.delete(orderId), 15 * 60 * 1000);

        // Tạo URL thanh toán VNPAY
        const paymentUrl = createVNPayUrl(orderId, orderData.total_amount, getClientIP(req));
        
        // Trả về URL thanh toán cho client
        return res.json({ 
            success: true, 
            message: 'Vui lòng thanh toán để hoàn tất đơn hàng',
            payment_url: paymentUrl, // URL để redirect user đến VNPAY
            order_id: orderId
        });
    } catch (error) {
        // Rollback nếu có lỗi trong quá trình kiểm tra
        await t.rollback();
        throw error;
    }
};

/**
 * Controller chính để tạo đơn hàng
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const createOrder = async (req, res) => {
    try {
        // Destructure dữ liệu từ request body
        const { user_id, name, address, phone, discount_code_id, subtotal, 
                discount_amount, total_amount, payment_method, items } = req.body;

        // Tạo ID đơn hàng unique (timestamp + random string)
        const orderId = `ORDER_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        // Chuẩn bị dữ liệu đơn hàng
        const orderData = { 
            user_id, name, address, phone, 
            discount_code_id: discount_code_id || null, // Set null nếu không có discount
            subtotal, discount_amount, total_amount, payment_method 
        };

        // Xử lý theo phương thức thanh toán
        if (payment_method === 'COD') {
            // Thanh toán khi nhận hàng - tạo đơn hàng ngay
            return await handleCODPayment(orderId, orderData, items, res);
        }
        
        if (payment_method === 'VNPAY') {
            // Thanh toán online - tạo URL thanh toán
            return await handleVNPayPayment(orderId, orderData, items, req, res);
        }

        // Phương thức thanh toán không được hỗ trợ
        return res.status(400).json({ success: false, message: 'Phương thức thanh toán không hợp lệ' });
    } catch (error) {
        // Xử lý lỗi chung
        res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * Controller xử lý callback từ VNPAY sau khi thanh toán
 * @param {Object} req - Request object chứa query params từ VNPAY
 * @param {Object} res - Response object
 */
const vnpayReturn = async (req, res) => {
    try {
        // Copy tất cả query params từ VNPAY
        const params = { ...req.query };
        // Lấy chữ ký từ VNPAY gửi về
        const secureHash = params.vnp_SecureHash;
        
        // Xóa chữ ký khỏi params để tính toán lại chữ ký
        delete params.vnp_SecureHash;
        delete params.vnp_SecureHashType;

        // Sắp xếp params và tạo chuỗi để ký
        const sortedParams = sortObject(params);
        const signData = qs.stringify(sortedParams, { encode: false });
        // Tính toán chữ ký từ phía server
        const signature = createSignature(signData);

        // Kiểm tra tính hợp lệ của chữ ký
        if (secureHash !== signature) {
            return res.status(400).json({ success: false, message: 'Chữ ký không hợp lệ' });
        }

        // Lấy thông tin giao dịch
        const orderId = params.vnp_TxnRef; // ID đơn hàng
        const isSuccess = params.vnp_ResponseCode === '00'; // '00' = thành công
        
        // Nếu thanh toán thất bại
        if (!isSuccess) {
            pendingOrders.delete(orderId); // Xóa đơn hàng tạm
            return res.json({ success: false, message: 'Thanh toán thất bại', order_id: orderId });
        }

        // Thanh toán thành công -> Tạo đơn hàng thật
        const orderData = pendingOrders.get(orderId); // Lấy thông tin đơn hàng tạm
        if (!orderData) {
            return res.status(400).json({ success: false, message: 'Không tìm thấy thông tin đơn hàng' });
        }

        // Bắt đầu transaction để tạo đơn hàng
        const t = await sequelize.transaction();
        try {
            // Kiểm tra lại tồn kho (có thể đã thay đổi trong thời gian chờ thanh toán)
            await validateStock(orderData.items, t);

            // Tạo đơn hàng với trạng thái 'CONFIRM' và thông tin thanh toán
            const order = await createOrderRecord(
                orderId, 
                orderData, 
                orderData.items, 
                'CONFIRM', // Trạng thái đã xác nhận
                t, 
                {
                    payment_method: 'VNPAY',
                    payment_date: new Date(), // Thời gian thanh toán
                    vnpay_transaction_id: params.vnp_TransactionNo // ID giao dịch VNPAY
                }
            );

            // Trừ tồn kho
            await decrementStock(orderData.items, t);
            // Commit transaction
            await t.commit();
            
            // Xóa đơn hàng tạm khỏi memory
            pendingOrders.delete(orderId);

            // Trả về kết quả thành công
            res.json({
                success: true,
                message: 'Thanh toán và đặt hàng thành công',
                data: order
            });

        } catch (error) {
            // Rollback nếu có lỗi
            await t.rollback();
            throw error;
        }

    } catch (error) {
        // Xử lý lỗi chung
        res.status(500).json({ success: false, error: error.message });
    }
};

// Export các controller để sử dụng trong router
module.exports = { createOrder, vnpayReturn };