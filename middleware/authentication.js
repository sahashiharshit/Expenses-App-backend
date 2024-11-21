
const jwt = require('jsonwebtoken');
const fs = require('fs');
const User = require('../models/Users');
exports.authenticate =(req,res,next)=>{
    
try {
    const token = req.header('Authorization');
    const privateKey = fs.readFileSync('./private.pem','utf-8');
    
   
    const userid = jwt.verify(token,privateKey);
    
    User.findByPk(userid).then(user=>{
    req.user=user;
   
    next();
    }).catch(err=>{
    throw new Error(err)
    })
} catch (error) {
    console.log(error);
}
}