const { DataTypes } = require('sequelize');
const sequelize = require('../utils/connection');

const Customer = sequelize.define('customer', {
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
    password:{
        type: DataTypes.STRING,
        allowNull: true
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
    dni:{
        type: DataTypes.STRING,
        allowNull: false
    },    
    addres:{
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
    img_url:{
        type: DataTypes.TEXT,
        allowNull: true
    },
    isVerify:{
        type: DataTypes.BOOLEAN,
        allowNull: true
    }
});

module.exports = Customer;