import mongoose from 'mongoose';

const policyAcknowledgementSchema = new mongoose.Schema(
  {
    policyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Policy',
      required: [true, 'Policy reference is required'],
    },
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Employee reference is required'],
    },
    acknowledged: {
      type: Boolean,
      default: true,
    },
    acknowledgedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

policyAcknowledgementSchema.index({ policyId: 1, employeeId: 1 }, { unique: true });

export const PolicyAcknowledgement = mongoose.models.PolicyAcknowledgement || mongoose.model('PolicyAcknowledgement', policyAcknowledgementSchema);
