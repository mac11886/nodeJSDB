const { Sequelize, Model, DataTypes } = require('sequelize');
const { getSequelize } = require("../db")


class Amazon extends Model {}
const sequelize = getSequelize()

Amazon.init({
    job_id : DataTypes.NUMBER,
    product_id : DataTypes.TEXT,
    name : DataTypes.TEXT,
    price : DataTypes.TEXT,
    rating : DataTypes.TEXT,
    review : DataTypes.TEXT,
    img_src : DataTypes.TEXT,
    url : DataTypes.TEXT,
    rank : DataTypes.TEXT,
}, { sequelize, modelName: 'amazon', tableName: 'amazon', timestamps: false });

module.exports = Amazon