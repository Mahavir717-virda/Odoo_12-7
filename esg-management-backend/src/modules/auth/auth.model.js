import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
    },
    role: {
      type: String,
      enum: ['Employee', 'Admin'],
      default: 'Employee',
    },
    xp: {
      type: Number,
      default: 0,
    },
    points: {
      type: Number,
      default: 0,
    },
    department: {
      type: String,
      default: 'All',
    },
  },
  {
    timestamps: true,
  }
);

export const User = mongoose.models.User || mongoose.model('User', userSchema);
