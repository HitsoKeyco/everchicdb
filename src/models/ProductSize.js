const { DataTypes } = require('sequelize');
const sequelize = require('../utils/connection');

const ProductSize = sequelize.define('ProductSize', {
    // No se necesita campos adicionales aquí es una relacion de muchos a muchos
});

module.exports = ProductSize;
