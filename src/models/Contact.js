const { DataTypes } = require('sequelize');
const sequelize = require('../utils/connection');

const Contact = sequelize.define('contact', {
    dni:{
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    firstName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    lastName:{
        type: DataTypes.STRING,
        allowNull: false
    },
    email:{
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    company:{
        type: DataTypes.STRING,
        allowNull: true,
    },    
    phone:{
        type: DataTypes.STRING,
        allowNull: true,
    },
    address:{
        type: DataTypes.TEXT,
        allowNull: true,
    },
    city:{
        type: DataTypes.STRING,
        allowNull: true,
    },
    country:{
        type: DataTypes.STRING,
        allowNull: true,
    },
    
});

module.exports = Contact;