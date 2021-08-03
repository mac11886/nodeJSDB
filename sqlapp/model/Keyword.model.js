const { Sequelize, Model, DataTypes } = require('sequelize');
const { getSequelize } = require("../db")

class Keyword extends Model {}

const sequelize = getSequelize()

Keyword.init({
    thai_word : DataTypes.CHAR,
    eng_word : DataTypes.CHAR
}, { sequelize, modelName: 'keyword', tableName: 'keyword', timestamps: false });

module.exports = Keyword