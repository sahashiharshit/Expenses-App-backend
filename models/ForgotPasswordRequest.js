const Sequelize = require('sequelize');
const sequelize = require('../utils/database');
const {v4:uuidv4}=require('uuid');
const ForgotPasswordRequest = sequelize.define("forgotpasswordrequest",{

id:{
type:Sequelize.STRING,
defaultVale:()=>uuidv4(),
allowNull:false,
primaryKey:true,
},
isActive:{
type:Sequelize.BOOLEAN,
defaultVale:false,
allowNull:false,

}
});

module.exports = ForgotPasswordRequest;