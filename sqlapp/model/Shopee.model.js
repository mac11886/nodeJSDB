
const { Sequelize, Model, DataTypes } = require('sequelize');
const { getSequelize } = require("../db")

class Shopee extends Model {
    pk = "product_id"
}

const sequelize = getSequelize()

Shopee.init({
    job_id: DataTypes.NUMBER,
    product_id: DataTypes.CHAR,
    name: DataTypes.TEXT,
    price: DataTypes.CHAR,
    type: DataTypes.CHAR,
    star: DataTypes.FLOAT,
    sold: DataTypes.CHAR,
    send_from: DataTypes.CHAR,
    img_src: DataTypes.TEXT,
    url: DataTypes.TEXT
}, { sequelize, modelName: 'shopee', tableName: 'shopee', timestamps: false });

module.exports = Shopee
