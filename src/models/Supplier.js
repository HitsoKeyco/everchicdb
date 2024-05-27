const { DataTypes } = require('sequelize');
const sequelize = require('../utils/connection');

const Supplier = sequelize.define('supplier', {
    firstName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    lastName:{
        type: DataTypes.STRING,
        allowNull: false
    },
    email:{
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    company:{
        type: DataTypes.STRING,
        allowNull: true
    },
    phone:{
        type: DataTypes.STRING,
        allowNull: true
    },
    ruc:{
        type: DataTypes.STRING,
        allowNull: true
    },   
    address:{
        type: DataTypes.STRING,
        allowNull: true
    },
    city:{
        type: DataTypes.STRING,
        allowNull: true
    },
    country:{
        type: DataTypes.STRING,
        allowNull: true
    },

});

module.exports = Supplier;