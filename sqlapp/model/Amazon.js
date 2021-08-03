const Model = require("./model");
// const { Sequelize, Model, DataTypes } = require('sequelize');
// const { getSequelize } = require("../db")


class Amazon extends Model {
    constructor(){
        super("amazon","product_id",2)
    }

    getEmptyObj(){
        return {
            id : null,
            job_id : null,
            product_id : null,
            name : null,
            price : null,
            rating : null,
            review : null,
            img_src : null,
            url : null,
            rank : null
        }

    }
}
// const sequelize = getSequelize()

// Amazon.init({
//     job_id : DataTypes.NUMBER,
//     product_id : DataTypes.TEXT,
//     name : DataTypes.TEXT,
//     price : DataTypes.TEXT,
//     rating : DataTypes.TEXT,
//     review : DataTypes.TEXT,
//     img_src : DataTypes.TEXT,
//     url : DataTypes.TEXT,
//     rank : DataTypes.TEXT,
// }, { sequelize, modelName: 'amazon', tableName: 'amazon'});

module.exports = Amazon