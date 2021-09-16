const { Sequelize, Model, DataTypes } = require('sequelize');
const { getSequelize } = require("../db")


class BioType extends Model {}
const sequelize = getSequelize()

BioType.init({
    name_en : DataTypes.CHAR,
    name_th : DataTypes.CHAR,
    
}, { sequelize, modelName: 'biotype', tableName: 'biotype', timestamps: false });

module.exports = BioType