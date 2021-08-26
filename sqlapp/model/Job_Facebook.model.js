const { Sequelize, Model, DataTypes } = require('sequelize');
const { getSequelize } = require("../db")

class Job_FaceBook extends Model {}

const sequelize = getSequelize()

Job_FaceBook.init({
    page_name : DataTypes.CHAR,
    page_id : DataTypes.CHAR,
    worker : DataTypes.CHAR,
    amount_post : DataTypes.INTEGER,
    created_time : DataTypes.TIME,
    start_time : DataTypes.TIME,
    end_time : DataTypes.TIME,
    status : DataTypes.CHAR

}, { sequelize, modelName: 'job_facebook', tableName: 'job_facebook', timestamps: false });

module.exports = Job_FaceBook