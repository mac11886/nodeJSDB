
const { Sequelize, Model, DataTypes } = require('sequelize');
const { getSequelize } = require("../db")
const Shopee_model = require("./Shopee.model")
const Amazon_model = require("./Amazon.model")
const Pantip_model = require("./Pantip.model")
const Jd_model = require("./Jd.model")


class Main extends Model {}

const sequelize = getSequelize()


Main.init({
    key_id: DataTypes.NUMBER,
    service_id: DataTypes.NUMBER,
    e_id: DataTypes.NUMBER,
    timestamp: DataTypes.DATE,
}, { sequelize, modelName: 'main', tableName: 'main', timestamps: false });

Main.belongsTo(Shopee_model,{foreignKey: 'e_id',as: 'shopee' });
Main.belongsTo(Amazon_model,{foreignKey: 'e_id',as: 'amazon' });
Main.belongsTo(Pantip_model,{foreignKey: 'e_id',as: 'pantip'});
Main.belongsTo(Jd_model,{foreignKey: 'e_id',as: 'jd'});




module.exports = Main
