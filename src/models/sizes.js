'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Sizes extends Model {
    /**
     * Helper method for defining associations.
     */
    static associate(models) {
      Sizes.hasMany(models.Product_variants, {
        foreignKey: 'size_id',
        as: 'product_variants' // đúng: 1 Size có nhiều Product_variants
      });
  }}

  Sizes.init(
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
      modelName: 'Sizes', // tên model
      tableName: 'Sizes', // tên bảng trong database
      timestamps: true,        // tự thêm createdAt, updatedAt nếu true
    }
  );

  return Sizes;
};
