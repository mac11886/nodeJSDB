
const { Sequelize, Model, DataTypes } = require('sequelize');
const { getSequelize } = require("../db")

class Job extends Model {}

const sequelize = getSequelize()

Job.init({
    keyword : DataTypes.CHAR,
    service : DataTypes.CHAR,
    page : DataTypes.NUMBER,
    status : DataTypes.CHAR,
    created_time : DataTypes.DATE,
    start_time : DataTypes.DATE,
    end_time : DataTypes.DATE,
}, { sequelize, modelName: 'job', tableName: 'job', timestamps: false });

module.exports = Job