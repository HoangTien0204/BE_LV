'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Rating extends Model {
  
    static associate(models) {
      Rating.belongsTo(models.Users, {
        foreignKey: 'user_id',
        as: 'user' // đúng: 1 User có nhiều Rating
      });
      Rating.belongsTo(models.Orders, {
        foreignKey: 'order_id',
        as: 'order' // đúng: 1 Order có nhiều Rating
      });
      Rating.belongsTo(models.Products, {
        foreignKey: 'product_id',
        as: 'product' // đúng: 1 Product có nhiều Rating
      });
    }
  }

  Rating.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      product_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      user_id : {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      order_id: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      star_rating: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      is_approved: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      comment: {
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
      modelName: 'Ratings', // tên model
      tableName: 'ratings', // tên bảng trong database
      timestamps: true,        // tự thêm createdAt, updatedAt nếu true
    }
  );

  return Rating;
};
