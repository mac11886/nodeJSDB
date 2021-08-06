const { Sequelize, Model, DataTypes } = require('sequelize');
const { getSequelize } = require("../db")


class Amazon extends Model {
    pk = "product_id"
}
const sequelize = getSequelize()

Amazon.init({
    job_id : DataTypes.NUMBER,
    product_id : DataTypes.CHAR,
    name : DataTypes.TEXT,
    price : DataTypes.CHAR,
    rating : DataTypes.CHAR,
    review : DataTypes.CHAR,
    img_src : DataTypes.TEXT,
    url : DataTypes.TEXT,
    rank : DataTypes.CHAR,
}, { sequelize, modelName: 'amazon', tableName: 'amazon', timestamps: false });

module.exports = Amazon