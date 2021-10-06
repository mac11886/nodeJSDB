
const { Sequelize, Model, DataTypes } = require('sequelize');
const { getSequelize } = require("../db")
const Main_model = require("./Main.model")

class Shopee extends Model {
    pk = "product_id"
}

const sequelize = getSequelize()

Shopee.init({
    job_id: DataTypes.NUMBER,
    product_id: DataTypes.NUMBER,
    name: DataTypes.TEXT,
    price: DataTypes.CHAR,
    type: DataTypes.CHAR,
    star: DataTypes.FLOAT,
    sold: DataTypes.INTEGER,
    send_from: DataTypes.CHAR,
    img_src: DataTypes.TEXT,
    url: DataTypes.TEXT,
    brand: DataTypes.CHAR,
    rating: DataTypes.CHAR,
    description: DataTypes.TEXT,
    cat1: DataTypes.CHAR,
    cat2: DataTypes.CHAR,
    cat3:DataTypes.CHAR
}, { sequelize, modelName: 'shopee', tableName: 'shopee', timestamps: false });

// Shopee.hasMany(Main_model,{
//     foreignKey:'e_id'
// })

module.exports = Shopee
