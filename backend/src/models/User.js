import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  company: {
    type: String,
    required: true,
    trim: true
  },
  regNumber: {
    type: String,
    required: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  verified: {
    type: Boolean,
    default: false
  },
  verificationToken: {
    type: String,
    default: null
  }
}, { 
  timestamps: true 
});

// Index for better performance
userSchema.index({ email: 1 });

export default mongoose.model("User", userSchema);

