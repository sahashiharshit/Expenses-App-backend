const mongoose = require('mongoose');


const forgotPasswordRequestSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Assuming the request is linked to a user
        required: true,
    },
  isActive: {
    type: Boolean,
    default: false,
    required: true,
  }
}, { timestamps: true });

module.exports = mongoose.model('ForgotPasswordRequest', forgotPasswordRequestSchema);


