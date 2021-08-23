
const { Sequelize, Model, DataTypes } = require('sequelize');
const { getSequelize } = require("../db")

class Facebook extends Model {
    pk = "post_id"
}

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
    post_id: DataTypes.NUMBER,
    post_text: DataTypes.TEXT,
    meaning: DataTypes.CHAR,
    good_word: DataTypes.TEXT,	
    bad_word: DataTypes.TEXT,
    spa_word_count: DataTypes.NUMBER,
    travel_word_count: DataTypes.NUMBER,
    food_word_count:DataTypes.NUMBER,
    health_word_count: DataTypes.NUMBER,
    beauty_word_count:DataTypes.NUMBER,
    spa_word: DataTypes.TEXT,
    travel_word : DataTypes.TEXT,
    food_word : DataTypes.TEXT,
    health_word : DataTypes.TEXT,
    beauty_word : DataTypes.TEXT
    
}, { sequelize, modelName: 'facebook', tableName: 'facebook', timestamps: false });

module.exports = Facebook

