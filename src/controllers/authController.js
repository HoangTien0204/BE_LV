const { Users } = require('../models')
const { Admin } = require('../models');
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { omit, pick } = require('lodash')
const registerController = async (req, res, next) => {
    try {
        const { name, email, password, } = req.body
        const existedUser = await Users.findOne({
            where: { email }
        })
        if (existedUser) {
            return res.status(400).json({ status: 'false', message: 'Email đã tồn tại' })
        }
        console.log(existedUser)


        const data = await Users.create({
            name,
            email,
            password: bcrypt.hashSync(password, 10),
        });

        return res.status(201).json({
            status: 'true',
            message: 'Đăng ký thành công',
            data
        })
    } catch (error) {
        console.log(error)
        next(error)
    }
}
const loginController = async (req, res, next) => {
    try {
        const { email, password } = req.body
        const existedUser = await Users.findOne({ where: { email } })
        const isMatch = bcrypt.compareSync(password, existedUser.password)
        if (!isMatch || !existedUser) {
            return res.status(400).json({
                status: 'false',
                message: 'tai khoan hoac mat khau khong chinh sac'
            })
        }
        const users = pick(existedUser, ['id', 'name'])
        const token = jwt.sign({
            users 
        }, 'key', { expiresIn: '1d' }
        )
        return res.status(200).json({
            status: 'true',
            message: 'dang nhap thanh cong',
            data: users,
            token
        })
    } catch (error) {
        console.log(error)
        next(error)
    }
}

const adminLoginController = async (req, res, next) => {
    try {
        const { email, password } = req.body
        const existedUser = await Admin.findOne({ where: { email } })
        const isMatch = bcrypt.compareSync(password, existedUser.password)
        if (!isMatch || !existedUser) {
            return res.status(400).json({
                status: 'false',
                message: 'tai khoan hoac mat khau khong chinh sac'
            })
        }
        const admins = pick(existedUser, ['id', 'name'])
        const token = jwt.sign({
            admins 
        }, 'key', { expiresIn: '1d' }
        )
        return res.status(200).json({
            status: 'true',
            message: 'dang nhap thanh cong',
            data: admins,
            token
        })
    } catch (error) {
        console.log(error)
        next(error)
    }
  };
  
module.exports = {
    registerController,
    loginController,
    adminLoginController
}