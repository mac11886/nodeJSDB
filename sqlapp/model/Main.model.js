
const { Sequelize, Model, DataTypes } = require('sequelize');
const { getSequelize } = require("../db")

class Main extends Model {}

const sequelize = getSequelize()

Main.init({
    key_id: DataTypes.NUMBER,
    service_id: DataTypes.NUMBER,
    e_id: DataTypes.NUMBER,
    timestamp: DataTypes.DATE,
}, { sequelize, modelName: 'main', tableName: 'main', timestamps: false });

module.exports = Main
