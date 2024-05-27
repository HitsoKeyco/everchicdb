const { DataTypes } = require('sequelize');
const sequelize = require('../utils/connection');

const Bank = sequelize.define('bank', {
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
});

module.exports = Bank;