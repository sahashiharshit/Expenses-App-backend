const mongoose = require('mongoose');


const fileUrlSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Assuming the file URL is linked to a user
    required: true,
  },  
  fileUrl: {
    type: String,
    required: true,
  }
}, { timestamps: true });

module.exports = mongoose.model('FileUrl', fileUrlSchema);


