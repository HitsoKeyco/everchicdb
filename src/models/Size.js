const { DataTypes } = require('sequelize');
const sequelize = require('../utils/connection');

const Size = sequelize.define('size', {
    size: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
});

module.exports = Size;