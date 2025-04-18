const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
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
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Assuming each order belongs to a user
    required: true,
  }
}, { timestamps: true });


module.exports  = mongoose.model('Order', orderSchema);

