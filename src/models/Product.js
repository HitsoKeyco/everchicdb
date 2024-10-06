const { DataTypes } = require('sequelize');
const sequelize = require('../utils/connection');

const Product = sequelize.define('product', {
    sku: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,        
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    stock: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    weight:{
        type: DataTypes.DECIMAL,
        allowNull: false,
        get() {
            const rawValue = this.getDataValue('weight');
            return parseFloat(rawValue);
        }
    },
    cost_price: {
        type: DataTypes.DECIMAL,
        allowNull: false,
        get() {
            const rawValue = this.getDataValue('cost_price');
            return parseFloat(rawValue);
        }
    },
    new_product: {
        type: DataTypes.BOOLEAN,        
        defaultValue: false,

    },
    sell_price: {
        type: DataTypes.DECIMAL,
        allowNull: false,
        get() {
            const rawValue = this.getDataValue('sell_price');
            return parseFloat(rawValue);
        }
    },
    deleted_at: {
        type: DataTypes.BOOLEAN,
        allowNull: false 
    }
    //SizeId
    //categoryId
    //TagsId
    //ImageId
    //SupplierId
});

module.exports = Product;

