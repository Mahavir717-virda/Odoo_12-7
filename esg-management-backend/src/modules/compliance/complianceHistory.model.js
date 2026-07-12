import mongoose from 'mongoose';

const complianceHistorySchema = new mongoose.Schema(
  {
    complianceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Compliance',
      required: [true, 'Compliance reference is required'],
    },
    status: {
      type: String,
      required: [true, 'Status is required'],
    },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User making the change is required'],
    },
    remarks: {
      type: String,
      trim: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

complianceHistorySchema.index({ complianceId: 1 });

export const ComplianceHistory = mongoose.models.ComplianceHistory || mongoose.model('ComplianceHistory', complianceHistorySchema);
