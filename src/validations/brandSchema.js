const Joi = require('joi');

const createBrandSchema = Joi.object({
    name: Joi.string().min(2).required().messages({
      'string.empty': 'Tên không được để trống',
      'string.min': 'Tên phải có ít nhất 2 ký tự',
      'any.required': 'Tên là bắt buộc',
    }),
  });
  
  const validatorMiddleware = (schema) => {
    return (req, res, next) => {
      const { error } = schema.validate(req.body);
  
      if (error) {
        return res.status(400).json({ error: error.details[0].message});
      }
      if (!req.file) {
        return res.status(400).json({ error: 'Ảnh là bắt buộc' });
      }
      next();
    };
  };
const updateBrandSchema = Joi.object({
    name: Joi.string().min(2).required().messages({
      'string.empty': 'name không được để trống',
      'string.min': 'name phải có ít nhất 2 kí tự',
      'any.required': 'name là bắt buộc'
    })
  });
  
  module.exports = { createBrandSchema, updateBrandSchema ,validatorMiddleware};