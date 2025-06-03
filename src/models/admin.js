'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Admin extends Model {
        static associate(models) {
            // Định nghĩa mối quan hệ nếu cần
        }
    }

    Admin.init(
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
            email: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
            },
            password: {
                type: DataTypes.STRING,
                allowNull: false,
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
            modelName: 'Admin',
            tableName: 'Admin',
            timestamps: true,
        }
    );

    return Admin;
};
