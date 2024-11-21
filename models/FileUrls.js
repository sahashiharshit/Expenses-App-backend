const Sequelize = require('sequelize');
const sequelize = require('../utils/database');
const {v4:uuidv4}=require('uuid');
const FileUrls = sequelize.define('fileurls',{
id:{
type:Sequelize.STRING,
defaultVale:()=>uuidv4(),
allowNull:false,
primaryKey:true,

},
fileUrl:{
type:Sequelize.STRING,
allowNull:false,
}

});
module.exports = FileUrls;