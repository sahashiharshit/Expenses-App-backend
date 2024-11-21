const Sequelize = require("sequelize");
const sequelize = require("../utils/database");

const User = sequelize.define("users", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  username: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  email: { 
    type: Sequelize.STRING,
    allowNull:false,
    unique:true,
    
  },
  password: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  ispremiumuser:{
  type:Sequelize.BOOLEAN,
  defaultValue:false,
  allowNull:false,
  },
  totalexpenses:{
  type:Sequelize.BIGINT,
  allowNull:false,
  defaultValue:"0",
  
  }
});

module.exports = User;
