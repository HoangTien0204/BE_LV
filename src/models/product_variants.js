'use strict';
const { Model, DataTypes } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Product_variants extends Model {
    /**
     * Helper method for defining associations.
     */
    static associate(models) {
      Product_variants.belongsTo(models.Products, {
        foreignKey: 'product_id',
        as: 'product'
      });
      Product_variants.belongsTo(models.Sizes, {
        foreignKey: 'size_id',
        as: 'sizes' // alias nên là tên của entity cha
      });
      Product_variants.belongsTo(models.Colors, {
        foreignKey: 'color_id',
        as: 'colors' // alias nên là tên của entity cha
      });
    }

  }

  Product_variants.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    color_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    size_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    stock_quantity: {
      type: DataTypes.INTEGER,
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
      modelName: 'Product_variants',
      tableName: 'Product_variants',
      timestamps: true,
    }

  );
  return Product_variants;
};
