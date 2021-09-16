
const { Sequelize, Model, DataTypes } = require('sequelize');
const { getSequelize } = require("../db")
const Main_model = require("./Main.model")

class Thaijo extends Model {
}

const sequelize = getSequelize()

Thaijo.init({
    issue_id : DataTypes.NUMBER,
    job_id : DataTypes.NUMBER,
    abstract_clean : DataTypes.TEXT,
    title : DataTypes.TEXT,
    article_url : DataTypes.TEXT,
    issue_date_published : DataTypes.DATE,
    issue_cover_Image : DataTypes.TEXT,
    authors_full_name : DataTypes.CHAR,
    authors_affiliation : DataTypes.CHAR,
    created_at : DataTypes.DATE,
    updated_at : DataTypes.DATE,

}, { sequelize, modelName: 'thaijo', tableName: 'thaijo', timestamps: false });

// Shopee.hasMany(Main_model,{
//     foreignKey:'e_id'
// })

module.exports = Thaijo
