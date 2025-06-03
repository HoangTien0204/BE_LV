'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Products extends Model {
    /**
     * Helper method for defining associations.
     */
    static associate(models) {
        Products.belongsTo(models.Categories, {
            foreignKey: 'category_id',
            as: 'category'
          });
          Products.belongsTo(models.Brands, {
            foreignKey: 'brand_id',
            as: 'brands'
          });
          Products.hasMany(models.Product_image, {
            foreignKey: 'product_id',
            as: 'product_image'
          });
          Products.hasMany(models.Product_variants, {
            foreignKey: 'product_id',
            as: 'product_variants'
          });
         
          
    }

  }

  Products.init(
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
      description: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      price:{
        type: DataTypes.INTEGER,
        allowNull:true,
      },
      promotional:{
        type: DataTypes.INTEGER,
        allowNull:true,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      brand_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      category_id:{
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true 
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
      modelName: 'Products', // tên model
      tableName: 'Products', // tên bảng trong database
      timestamps: true,        // tự thêm createdAt, updatedAt nếu true
    }
  );

  return Products;
};
