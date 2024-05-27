const { DataTypes } = require('sequelize');
const sequelize = require('../utils/connection');

const Collection = sequelize.define('collection', {
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
});

module.exports = Collection;