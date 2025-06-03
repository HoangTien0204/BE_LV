'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Orders extends Model {
    /**
     * Helper method for defining associations.
     */
    
  }

  Orders.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      address: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      discount_code_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      subtotal: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      discount_amount: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      total_amount: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      status: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      payment_method: {
        type: DataTypes.STRING,
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
      modelName: 'Orders', // tên model
      tableName: 'Orders', // tên bảng trong database
      timestamps: true,        // tự thêm createdAt, updatedAt nếu true
    }
  );

  return Orders;
};
