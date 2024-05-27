const { DataTypes } = require('sequelize');
const sequelize = require('../utils/connection');

const Credit = sequelize.define('credit', {
    credit: {
        type: DataTypes.STRING,
        allowNull: false
    },
    date: {
        type: DataTypes.DATE,
        allowNull: false
    },
    paymentMethod: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    //ExpenseId
});

module.exports = Credit;