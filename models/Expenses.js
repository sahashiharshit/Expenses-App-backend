const Sequelize = require('sequelize');
const sequelize = require('../utils/database');

const Expenses = sequelize.define("expenses",{

id:{
    type: Sequelize.INTEGER,
    autoIncrement:true,
    allowNull:false,
    primaryKey:true,
},
money:{
    type:Sequelize.INTEGER,
    allowNull:false,
},
expenseName:{
    type:Sequelize.TEXT,
    allowNull:false,
},
category:{
type:Sequelize.TEXT,
allowNull:false,

},



});

module.exports = Expenses;