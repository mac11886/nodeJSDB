
const { Sequelize, Model, DataTypes } = require('sequelize');
const { getSequelize } = require("../db")

class Service extends Model {}

const sequelize = getSequelize()

Service.init({
    name : DataTypes.CHAR
}, { sequelize, modelName: 'service', tableName: 'service', timestamps: false });

module.exports = Service
