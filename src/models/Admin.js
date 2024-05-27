const { DataTypes } = require('sequelize');
const sequelize = require('../utils/connection');


const Admin = sequelize.define('admin', {
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
        unique: true
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    }
    //rolId
});

Admin.prototype.toJSON = function () {
    const values = { ...this.get() };
    delete values.password;
    return values;
}

module.exports = Admin;
