
const { Sequelize, Model, DataTypes } = require('sequelize');
const { getSequelize } = require("../db")

class Pantip extends Model {
    pk = "post_id"
}

const sequelize = getSequelize()

Pantip.init({
    job_id:	DataTypes.NUMBER,
    title: DataTypes.TEXT,
    author: DataTypes.TEXT,
    author_id: DataTypes.CHAR,
    story: DataTypes.TEXT,
    like_count: DataTypes.CHAR,
    emo_count: DataTypes.CHAR,
    allemos: DataTypes.TEXT,
    tags: DataTypes.TEXT,
    date_time: DataTypes.CHAR,
    post_link: DataTypes.TEXT,
    img_src: DataTypes.TEXT,
    post_id: DataTypes.CHAR,
    meaning: DataTypes.CHAR,
    good_word: DataTypes.TEXT,	
    bad_word: DataTypes.TEXT,
    spa_word: DataTypes.TEXT,
    travel_word: DataTypes.TEXT,
    food_word: DataTypes.TEXT,
    health_word: DataTypes.TEXT,
    beauty_word: DataTypes.TEXT,
    spa_word_count: DataTypes.NUMBER,
    travel_word_count: DataTypes.NUMBER,
    food_word_count: DataTypes.NUMBER,
    health_word_count: DataTypes.NUMBER,
    beauty_word_count: DataTypes.NUMBER,
}, { sequelize, modelName: 'pantip', tableName: 'pantip', timestamps: false });

module.exports = Pantip
