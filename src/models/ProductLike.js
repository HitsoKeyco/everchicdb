const { DataTypes } = require('sequelize');
const sequelize = require('../utils/connection');

const ProductLike = sequelize.define('productLike', {
    //user_id
    //product_id
});

module.exports = ProductLike;