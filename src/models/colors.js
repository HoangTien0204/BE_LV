'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Colors extends Model {
    static associate(models) {
        Colors.hasMany(models.Product_variants, {
          foreignKey: 'color_id',
          as: 'product_variants' // đúng: 1 Size có nhiều Product_variants
        });
    }  
  }

  Colors.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      code: {
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
      modelName: 'Colors', // tên model
      tableName: 'Colors', // tên bảng trong database
      timestamps: true,        // tự thêm createdAt, updatedAt nếu true
    }
  );

  return Colors;
};
