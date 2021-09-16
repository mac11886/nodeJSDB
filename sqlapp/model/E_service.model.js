
const { Sequelize, Model, DataTypes } = require('sequelize');
const { getSequelize } = require("../db")

class E_service extends Model {}

const sequelize = getSequelize()

E_service.init({
    service_id: DataTypes.NUMBER,
    e_id: DataTypes.NUMBER,

}, { sequelize, modelName: 'e_service', tableName: 'e_service', timestamps: false });

module.exports = E_service
