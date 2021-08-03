
const { Sequelize, Model, DataTypes } = require('sequelize');
const { getSequelize } = require("../db")

class Facebook extends Model {}

const sequelize = getSequelize()

Facebook.init({
    job_id:	DataTypes.NUMBER,
    user_name: DataTypes.TEXT,
    comment: DataTypes.TEXT,
    date: DataTypes.TEXT,
    image_h: DataTypes.TEXT,
    image_l: DataTypes.TEXT,
    reaction: DataTypes.TEXT,
    post_url: DataTypes.TEXT,
    post_id: DataTypes.TEXT,
    post_text: DataTypes.TEXT,
    meaning: DataTypes.CHAR,
    good_word: DataTypes.TEXT,	
    bad_word: DataTypes.TEXT	
}, { sequelize, modelName: 'facebook', tableName: 'facebook', timestamps: false });

module.exports = Facebook

