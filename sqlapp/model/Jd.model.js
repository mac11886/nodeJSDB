const { Sequelize, Model, DataTypes } = require('sequelize');
const { getSequelize } = require("../db")

class Jd extends Model {
    pk = "product_id"
}

const sequelize = getSequelize()

Jd.init({
    job_id : DataTypes.NUMBER,
    product_id : DataTypes.TEXT,
    name : DataTypes.TEXT,
    price : DataTypes.NUMBER,
    img_src : DataTypes.TEXT,
    type : DataTypes.TEXT,
    review : DataTypes.TEXT,
    send_from : DataTypes.TEXT
}, { sequelize, modelName: 'jd', tableName: 'jd', timestamps: false });

module.exports = Jd
