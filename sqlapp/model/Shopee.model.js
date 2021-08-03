
const { Sequelize, Model, DataTypes } = require('sequelize');
const { getSequelize } = require("../db")

class Shopee extends Model {
    pk = "product_id"
}

const sequelize = getSequelize()

Shopee.init({
    job_id: DataTypes.NUMBER,
    product_id: DataTypes.TEXT,
    name: DataTypes.TEXT,
    price: DataTypes.TEXT,
    type: DataTypes.TEXT,
    star: DataTypes.FLOAT,
    sold: DataTypes.TEXT,
    send_from: DataTypes.TEXT,
    img_src: DataTypes.TEXT,
    url: DataTypes.TEXT
}, { sequelize, modelName: 'shopee', tableName: 'shopee', timestamps: false });

module.exports = Shopee
