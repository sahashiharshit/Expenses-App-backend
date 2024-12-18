const express = require("express");
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const db = require("./utils/database");

const authentication = require('./routes/authenticationRoute');
const expenses = require('./routes/expenseRoute');
const premium = require('./routes/premiumRoute');

const User = require("./models/Users");
const Expenses = require("./models/Expenses");
const Order = require("./models/Orders");
const ForgotPasswordRequest = require("./models/ForgotPasswordRequest");
const FileUrls = require("./models/FileUrls");

const app= express();
const accessLogStream = fs.createWriteStream(path.join(__dirname,'access.log'),{flags:'a'});

app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan("combined",{stream:accessLogStream}))
app.use('/', express.static(path.join(__dirname, 'public')));
app.use("/expense",authentication);
app.use("/expense",expenses);
app.use("/purchase",premium);
app.use("/premium",premium);
app.use("/password",authentication);

app.get('/',(req,res)=>{
res.sendFile(path.join(__dirname, 'views','index.html'));

});
app.get('*',(req,res)=>{
  const requestedUrl = req.url;
  if(requestedUrl.startsWith('/views/')){
  res.sendFile(path.join(__dirname,requestedUrl));
  
  }else{
    res.sendFile(path.join(__dirname,'public',requestedUrl));
  }
});

User.hasMany(Expenses);
Expenses.belongsTo(User);
User.hasMany(Order);
Order.belongsTo(User);
User.hasMany(ForgotPasswordRequest,{
foreignKey:'userId',
onDelete:'CASCADE',
});
ForgotPasswordRequest.belongsTo(User,{
  foreignKey:'userId',
});
User.hasMany(FileUrls);
FileUrls.belongsTo(User);


db.sync()
  .then(() => {
    app.listen(process.env.PORT);
  })
  .catch((err) => console.log(err));



