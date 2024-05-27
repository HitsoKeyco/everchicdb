const { DataTypes } = require('sequelize');
const sequelize = require('../utils/connection');

const CategoryExpense = sequelize.define('categoryExpense', {
    category: {
        type: DataTypes.STRING,
        allowNull: false
    },
});

module.exports = CategoryExpense;