const { Sequelize, Model, DataTypes } = require('sequelize');
const { getSequelize } = require("../db")

class Facebook_page extends Model {}

const sequelize = getSequelize()

Facebook_page.init({
    name: DataTypes.TEXT,

}, { sequelize, modelName: 'facebook_page', tableName: 'facebook_page', timestamps: false });

module.exports = Facebook_page