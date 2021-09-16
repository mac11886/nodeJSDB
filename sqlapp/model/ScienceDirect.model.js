
const { Sequelize, Model, DataTypes } = require('sequelize');
const { getSequelize } = require("../db")
const Main_model = require("./Main.model")

class ScienceDirect extends Model {
}

const sequelize = getSequelize()

ScienceDirect.init({
    keyword_id : DataTypes.NUMBER,
    job_id : DataTypes.NUMBER,
    year : DataTypes.NUMBER,
    amount : DataTypes.NUMBER,
    created_at : DataTypes.DATE,
    updated_at : DataTypes.DATE

}, { sequelize, modelName: 'sciencedirect', tableName: 'sciencedirect', timestamps: false });

// Shopee.hasMany(Main_model,{
//     foreignKey:'e_id'
// })

module.exports = ScienceDirect
