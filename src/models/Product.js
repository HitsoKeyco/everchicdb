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
        allowNull: false
    },
    cost_price: {
        type: DataTypes.DECIMAL,
        allowNull: false
    },
    sell_price: {
        type: DataTypes.DECIMAL,
        allowNull: false
    },
    deleted_at: {
        type: DataTypes.DATE,
        defaultValue: null // Valor por defecto es null, indicando que no ha sido eliminado
    }
    //SizeId
    //categoryId
    //TagsId
    //ImageId
    //SupplierId
});

module.exports = Product;

