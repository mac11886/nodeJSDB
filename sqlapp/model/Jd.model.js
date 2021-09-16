const { Sequelize, Model, DataTypes } = require('sequelize');
const { getSequelize } = require("../db")

class Jd extends Model {
    pk = "product_id"
}

const sequelize = getSequelize()

Jd.init({
    job_id : DataTypes.NUMBER,
    product_id : DataTypes.NUMBER,
    name : DataTypes.TEXT,
    price : DataTypes.FLOAT,
    img_src : DataTypes.TEXT,
    type : DataTypes.CHAR,
    review : DataTypes.CHAR,
    send_from : DataTypes.CHAR,
    url : DataTypes.TEXT
}, { sequelize, modelName: 'jd', tableName: 'jd', timestamps: false });

module.exports = Jd
