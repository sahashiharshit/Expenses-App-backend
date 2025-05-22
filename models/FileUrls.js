import mongoose from 'mongoose';


const fileUrlSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Assuming the file URL is linked to a user
    required: true,
  },  
  s3Key: {
    type: String,
    required: true,
  }
}, { timestamps: true });

export default mongoose.model('FileUrl', fileUrlSchema);


