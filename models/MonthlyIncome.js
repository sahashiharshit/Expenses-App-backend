import {model, Schema} from 'mongoose';
const monthlyIncomeSchema = new Schema({
userId:{
type:Schema.Types.ObjectId,
ref:'User',
required:true,
},
amount:{
type:Number,
required:true,
},
date:{
type:Date,
default:Date.now,
}


});
export default model('MonthlyIncome',monthlyIncomeSchema);