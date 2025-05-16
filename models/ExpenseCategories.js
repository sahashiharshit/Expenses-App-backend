import { Schema, model} from 'mongoose';

const expenseCategorySchema = new Schema({
categoryName:{
type:String,
required:true,
}




},{timestamps:true});

export default model('ExpenseCategory', expenseCategorySchema);