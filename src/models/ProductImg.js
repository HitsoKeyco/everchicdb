const { DataTypes } = require('sequelize');
const sequelize = require('../utils/connection');

const ProductImg = sequelize.define('productImg', {
    url_small: {
        type: DataTypes.STRING,
        allowNull: true
    },
    url_medium: {
        type: DataTypes.STRING,
        allowNull: true
    },
    filename: {
        type: DataTypes.STRING,
        allowNull: true
    },
    //productId
});

module.exports = ProductImg;