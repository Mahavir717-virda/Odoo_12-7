import mongoose from 'mongoose';

const badgeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Badge title is required'],
      unique: true,
      trim: true,
    },
    icon: {
      type: String,
      required: [true, 'Badge icon filename is required'],
      default: 'badge.png',
    },
    xpRequired: {
      type: Number,
      default: 0,
      min: [0, 'XP required cannot be negative'],
    },
    challengeCount: {
      type: Number,
      default: 0,
      min: [0, 'Challenge count required cannot be negative'],
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const Badge = mongoose.model('Badge', badgeSchema);
