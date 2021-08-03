
const { Sequelize, Model, DataTypes } = require('sequelize');
const { getSequelize } = require("../db")

class Pantip extends Model {}

const sequelize = getSequelize()

Pantip.init({
    job_id:	DataTypes.NUMBER,
    title: DataTypes.TEXT,
    author: DataTypes.TEXT,
    author_id: DataTypes.TEXT,
    story: DataTypes.TEXT,
    like_count: DataTypes.TEXT,
    emo_count: DataTypes.TEXT,
    allemos: DataTypes.TEXT,
    tags: DataTypes.TEXT,
    date_time: DataTypes.TEXT,
    post_link: DataTypes.TEXT,
    img_src: DataTypes.TEXT,
    post_id: DataTypes.TEXT,
    meaning: DataTypes.CHAR,
    good_word: DataTypes.TEXT,	
    bad_word: DataTypes.TEXT	
}, { sequelize, modelName: 'pantip', tableName: 'pantip', timestamps: false });

module.exports = Pantip
