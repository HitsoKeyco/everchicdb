const { DataTypes } = require('sequelize');
const sequelize = require('../utils/connection');

const ProductTag = sequelize.define('productTag', {
    // No se necesita campos adicionales aquí es una relacion de muchos a muchos
});

module.exports = ProductTag;