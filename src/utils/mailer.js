const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'trantanphat2002@gmail.com',
    pass: 'i----'

  }
});

const sendOTP = async (to, otp) => {
  await transporter.sendMail({
    from: 'your_email@gmail.com',
    to,
    subject: 'Mã OTP đặt lại mật khẩu',
    text: `Mã OTP của bạn là: ${otp}. Mã này có hiệu lực trong 1 phút.`
  });
};

module.exports = { sendOTP };
