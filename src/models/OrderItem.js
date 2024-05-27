const { DataTypes } = require('sequelize');
const sequelize = require('../utils/connection');

const OrderItem = sequelize.define('orderItem', {
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    price_unit: {
        type: DataTypes.DECIMAL,
        allowNull: true
    },
    free: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    }
    //ProductId
});

module.exports = OrderItem;