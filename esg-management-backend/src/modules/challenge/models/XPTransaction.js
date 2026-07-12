import mongoose from 'mongoose';

const xpTransactionSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Employee reference is required'],
    },
    challengeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Challenge',
      default: null,
    },
    xpEarned: {
      type: Number,
      required: [true, 'XP earned is required'],
    },
    pointsEarned: {
      type: Number,
      required: [true, 'Points earned is required'],
    },
    reason: {
      type: String,
      required: [true, 'Reason for transaction is required'],
      trim: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
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

xpTransactionSchema.index({ employeeId: 1 });

export const XPTransaction = mongoose.model('XPTransaction', xpTransactionSchema);
