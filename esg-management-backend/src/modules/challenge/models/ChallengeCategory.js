import mongoose from 'mongoose';

const challengeCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      unique: true,
      trim: true,
    },
    icon: {
      type: String,
      default: 'leaf.png',
    },
    color: {
      type: String,
      default: '#00AA55',
    },
    description: {
      type: String,
      trim: true,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export const ChallengeCategory = mongoose.model('ChallengeCategory', challengeCategorySchema);
