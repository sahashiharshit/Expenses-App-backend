
import jwt from 'jsonwebtoken';
import { readFileSync } from 'fs';
import User from '../models/Users.js';
export function authenticate(req,res,next){
    
try {
   
    const token = req.header('Authorization');
    const privateKey = readFileSync('./private.pem','utf-8');
   
   
    const userid = jwt.verify(token,privateKey);

    
    User.findById({_id:userid}).then(user=>{
    if(!user){
        return res.status(401).json({message:'Unauthorized User'});
    }
    req.user=user;
   
    next();
    }).catch(err=>{
    throw new Error(err)
    })
} catch (error) {
    console.log(error);
}
}