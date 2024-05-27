const { DataTypes } = require('sequelize');
const sequelize = require('../utils/connection');

const User = sequelize.define('user', {
    dni:{
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
    },
    firstName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    lastName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
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
    phone_first: {
        type: DataTypes.STRING,
        allowNull: true
    },
    phone_second: {
        type: DataTypes.STRING,
        allowNull: true
    },
    isVerify: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    verificationToken: { // Agrega este campo para el token de verificación
        type: DataTypes.STRING,
        allowNull: true // Puede ser nulo temporalmente hasta que se asigne un token ojo
    }
});

User.prototype.toJSON = function () {
    const values = { ...this.get() };
    delete values.password;
    return values;
}

module.exports = User;