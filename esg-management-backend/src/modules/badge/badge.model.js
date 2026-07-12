import mongoose from 'mongoose';
import { ALLOWED_BADGE_CATEGORIES, BADGE_CATEGORIES } from './badge.constants.js';

const badgeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Badge name is required'],
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Badge description is required'],
      trim: true,
    },
    category: {
      type: String,
      enum: {
        values: ALLOWED_BADGE_CATEGORIES,
        message: 'Invalid badge category',
      },
      default: BADGE_CATEGORIES.ENVIRONMENTAL,
    },
    icon: {
      type: String,
      default: 'badge.png',
    },
    badgeColor: {
      type: String,
      default: '#28A745',
    },
    xpRequired: {
      type: Number,
      default: 0,
      min: [0, 'XP requirement cannot be negative'],
    },
    challengeRequired: {
      type: Number,
      default: 0,
      min: [0, 'Challenge requirement cannot be negative'],
    },
    department: {
      type: String,
      default: 'All',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

badgeSchema.index({ isActive: 1 });

export const Badge = mongoose.models.Badge || mongoose.model('Badge', badgeSchema);
