const { DataTypes } = require('sequelize');
const sequelize = require('../utils/connection');

const OrderStatus = sequelize.define('orderStatus', {
    order_status: {
        type: DataTypes.STRING,
        allowNull: false
    },
});

module.exports = OrderStatus;