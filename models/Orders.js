import { Schema, model } from 'mongoose';

const orderSchema = new Schema({
  paymentid: {
    type: String,
    required: false,
  },
  orderid: {
    type: String,
    required: false,
  },
  status: {
    type: String,
    required: false,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User', // Assuming each order belongs to a user
    required: true,
  }
}, { timestamps: true });


export default model('Order', orderSchema);

