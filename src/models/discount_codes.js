'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Discount_codes extends Model {
    /**
     * Helper method for defining associations.
     */
    
  }

  Discount_codes.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      code: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      discount_type: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      discount_value: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      min_order_value: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      usage_limit: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      used_count: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      start_date: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      end_date: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'Discount_codes', // tên model
      tableName: 'Discount_codes', // tên bảng trong database
      timestamps: true,        // tự thêm createdAt, updatedAt nếu true
    }
  );

  return Discount_codes;
};
