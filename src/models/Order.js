const { DataTypes } = require('sequelize');
const sequelize = require('../utils/connection');

const Order = sequelize.define('order', {
    total:{
        type:DataTypes.DECIMAL,
        allowNull: false,
    },
    paid:{
        type:DataTypes.BOOLEAN,
        defaultValue: false,
    },
    
    //user_id
    //admin_Id
    //StatusOrder_id    
})

module.exports = Order

