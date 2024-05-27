const { DataTypes } = require('sequelize');
const sequelize = require('../utils/connection');

const Tag = sequelize.define('tag', {
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        
    }
});

module.exports = Tag;