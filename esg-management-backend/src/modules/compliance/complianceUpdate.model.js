import mongoose from 'mongoose';

const complianceUpdateSchema = new mongoose.Schema(
  {
    complianceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Compliance',
      required: [true, 'Compliance reference is required'],
    },
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Employee reference is required'],
    },
    progress: {
      type: Number,
      required: [true, 'Progress value is required'],
      min: [0, 'Progress cannot be negative'],
      max: [100, 'Progress cannot exceed 100%'],
    },
    remarks: {
      type: String,
      required: [true, 'Remarks/notes are required'],
      trim: true,
    },
    attachment: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ['In Progress', 'Resolved'],
      required: [true, 'Status is required'],
    },
  },
  {
    timestamps: true,
  }
);

complianceUpdateSchema.index({ complianceId: 1 });

export const ComplianceUpdate = mongoose.models.ComplianceUpdate || mongoose.model('ComplianceUpdate', complianceUpdateSchema);
