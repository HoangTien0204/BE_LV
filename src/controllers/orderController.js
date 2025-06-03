const crypto = require('crypto');
const moment = require('moment');
const qs = require('qs');
const {Orders_detail,Orders, sequelize}=require('../models');

// VNPAY Configuration - thay đổi theo thông tin của bạn
const vnpayConfig = {
    vnp_TmnCode: 'Y23UTK8D', // Mã website của merchant trên VNPAY
    vnp_HashSecret: 'ZQ7X0L2ETEVQ8WQJRAT3B15TNEO7XMXT', // Chuỗi bí mật
    vnp_Url: 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html', // URL thanh toán VNPAY (sandbox)
    vnp_ReturnUrl: 'http://localhost:3000/api/vnpay/return', // URL trả về sau thanh toán
};

// Hàm sắp xếp object
const sortObjects = (obj) => {
    const sorted = {};
    const str = [];
    let key;
    // Use Object.keys to iterate over own properties, works for null-prototype objects too
    // or ensure obj is a plain object before calling this function.
    // For this case, we'll assume obj might be null-prototype and handle it safely.
    const keys = Object.keys(obj); 
    for (const k of keys) {
        str.push(encodeURIComponent(k));
    }
    str.sort();
    for (key = 0; key < str.length; key++) {
        // When using Object.keys, str[key] is already the key name
        const originalKey = decodeURIComponent(str[key]);
        sorted[str[key]] = encodeURIComponent(obj[originalKey]).replace(/%20/g, "+");
    }
    return sorted;
};
// A more robust sortObject that handles any object type for keys
const sortObjectRobust = (obj) => {
    let sorted = {};
    let str = [];
    let key;
    for (key in obj) {
        // Check if the property is directly on the object
        // For null-prototype objects, Object.prototype.hasOwnProperty.call is safer
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            str.push(encodeURIComponent(key));
        }
    }
    str.sort();
    for (key = 0; key < str.length; key++) {
        sorted[str[key]] = encodeURIComponent(obj[decodeURIComponent(str[key])]).replace(/%20/g, "+");
    }
    return sorted;
};



// Hàm tạo URL thanh toán VNPAY
const createVNPayUrl = (orderId, amount, orderInfo, ipAddr) => {
    const date = new Date();
    const createDate = moment(date).format('YYYYMMDDHHmmss');
    
    let vnp_Params = {};
    vnp_Params['vnp_Version'] = '2.1.0';
    vnp_Params['vnp_Command'] = 'pay';
    vnp_Params['vnp_TmnCode'] = vnpayConfig.vnp_TmnCode;
    vnp_Params['vnp_Locale'] = 'vn';
    vnp_Params['vnp_CurrCode'] = 'VND';
    vnp_Params['vnp_TxnRef'] = orderId;
    vnp_Params['vnp_OrderInfo'] = orderInfo;
    vnp_Params['vnp_OrderType'] = 'other';
    vnp_Params['vnp_Amount'] = amount * 100; // VNPAY yêu cầu amount * 100
    vnp_Params['vnp_ReturnUrl'] = vnpayConfig.vnp_ReturnUrl;
    vnp_Params['vnp_IpAddr'] = ipAddr;
    vnp_Params['vnp_CreateDate'] = createDate;
    
    // Sắp xếp params theo alphabet
    vnp_Params = sortObject(vnp_Params);
    
    const signData = qs.stringify(vnp_Params, { encode: false });
    const hmac = crypto.createHmac("sha512", vnpayConfig.vnp_HashSecret);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");
    vnp_Params['vnp_SecureHash'] = signed;
    
    return vnpayConfig.vnp_Url + '?' + qs.stringify(vnp_Params, { encode: false });
};

// Hàm sắp xếp object
const sortObject = (obj) => {
    const sorted = {};
    const str = [];
    let key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) {
            str.push(encodeURIComponent(key));
        }
    }
    str.sort();
    for (key = 0; key < str.length; key++) {
        sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
    }
    return sorted;
};

const createOrder = async (req, res, next) => {
    const t = await sequelize.transaction();
    try {
        const { 
            user_id, 
            name, 
            address, 
            phone, 
            discount_code_id, 
            subtotal, 
            discount_amount, 
            total_amount, 
            payment_method, 
            items 
        } = req.body;
        
        const discountId = discount_code_id === '' ? null : discount_code_id;
        let status = 'Pending'; // mặc định
        
        if (payment_method === 'COD') {
            status = 'Pending';
        } else if (payment_method === 'VNPAY' || payment_method === 'MOMO') {
            status = 'Confirm'; // chưa thanh toán, đợi xác nhận từ cổng thanh toán
        } else {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng chọn phương thức thanh toán COD, VNPAY hoặc MOMO',
            });
        }

        const orderId = `ORDER_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

        // Tạo đơn hàng
        const orders = await Orders.create({
            id: orderId,
            user_id,
            name,
            address,
            phone,
            discount_code_id: discountId,
            subtotal,
            discount_amount,
            total_amount,
            status,
            payment_method
        }, { transaction: t });

        // Tạo chi tiết đơn hàng
        for (let item of items) {
            const { product_variant_id, quantity, price } = item;
            await Orders_detail.create({
                order_id: orderId,
                product_variant_id,
                quantity,
                price
            }, { transaction: t });
        }

        await t.commit();

        // Xử lý thanh toán
        if (payment_method === 'VNPAY') {
            // Lấy IP address của client
            const ipAddr = req.headers['x-forwarded-for'] ||
                          req.connection.remoteAddress ||
                          req.socket.remoteAddress ||
                          (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
                          '127.0.0.1';

            // Tạo URL thanh toán VNPAY
            const orderInfo = `Thanh toan don hang ${orderId}`;
            const paymentUrl = createVNPayUrl(orderId, total_amount, orderInfo, ipAddr);

            return res.status(200).json({
                success: true,
                message: 'Order tạo thành công',
                data: orders,
                payment_url: paymentUrl // URL để redirect đến VNPAY
            });
        } else if (payment_method === 'MOMO') {
            // TODO: Implement MOMO payment integration
            return res.status(200).json({
                success: true,
                message: 'Order tạo thành công - MOMO payment coming soon',
                data: orders
            });
        } else {
            // COD
            return res.status(200).json({
                success: true,
                message: 'Order tạo thành công',
                data: orders
            });
        }

    } catch (error) {
        await t.rollback();
        console.error(error);
        return res.status(500).json({ 
            success: false,
            error: error.message 
        });
    }
};

// Hàm xử lý callback từ VNPAY
const vnpayReturn = async (req, res) => {
    try {
        console.log(req.query);
       
        let vnp_Params =req.query;
        const secureHash = vnp_Params['vnp_SecureHash'];

        delete vnp_Params['vnp_SecureHash'];
        delete vnp_Params['vnp_SecureHashType'];

        vnp_Params = sortObjectRobust(vnp_Params);
        console.log('DDAY LAF PRAM',vnp_Params)

        const signData = qs.stringify(vnp_Params, { encode: false });
        const hmac = crypto.createHmac("sha512", vnpayConfig.vnp_HashSecret);
        const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");

        if (secureHash === signed) {
            const orderId = vnp_Params['vnp_TxnRef'];
            const responseCode = vnp_Params['vnp_ResponseCode'];

            if (responseCode === '00') {
                // Thanh toán thành công
                await Orders.update(
                    { 
                        status: 'CONFIRM',
                        payment_date: new Date(),
                        vnpay_transaction_id: vnp_Params['vnp_TransactionNo']
                    },
                    { where: { id: orderId } }
                );

                return res.status(200).json({
                    success: true,
                    message: 'Thanh toán thành công',
                    order_id: orderId
                });
            } else {
                // Thanh toán thất bại
                await Orders.update(
                    { status: 'CANCEL' },
                    { where: { id: orderId } }
                );

                return res.status(400).json({
                    success: false,
                    message: 'Thanh toán thất bại',
                    order_id: orderId
                });
            }
        //     else {
        //         // Thanh toán thất bại -> XÓA đơn hàng và chi tiết
        //         await Orders_detail.destroy({ where: { order_id: orderId } });
        //         await Orders.destroy({ where: { id: orderId } });
            
        //         return res.status(400).json({
        //             success: false,
        //             message: 'Thanh toán thất bại - đơn hàng đã bị xóa',
        //             order_id: orderId
        //         });
        } else {
            return res.status(400).json({
                success: false,
                message: 'Chữ ký không hợp lệ'
            });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

module.exports = {
    createOrder,
    vnpayReturn
};