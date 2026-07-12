import mongoose from 'mongoose';
import {
  ALLOWED_ACTIVITY_TYPES,
  ALLOWED_APPROVAL_STATUSES,
  ALLOWED_TRANSACTION_STATUSES,
  ALLOWED_CALCULATION_METHODS,
  APPROVAL_STATUS,
  TRANSACTION_STATUS,
  CALCULATION_METHOD,
} from './carbonTransaction.constants.js';

// Try to register a stub User schema if not already defined to prevent runtime population issues
if (!mongoose.models.User) {
  const userSchema = new mongoose.Schema(
    {
      name: { type: String, required: true },
      email: { type: String, required: true },
    },
    { timestamps: true }
  );
  mongoose.model('User', userSchema);
}

const carbonTransactionSchema = new mongoose.Schema(
  {
    transactionNumber: {
      type: String,
      required: [true, 'Transaction number is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: [true, 'Department reference is required'],
    },
    productESGProfile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProductESGProfile',
      required: [true, 'Product ESG Profile reference is required'],
    },
    emissionFactor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'EmissionFactor',
      required: [true, 'Emission factor reference is required'],
    },
    activityType: {
      type: String,
      required: [true, 'Activity type is required'],
      enum: {
        values: ALLOWED_ACTIVITY_TYPES,
        message: 'Invalid activity type',
      },
    },
    activityReference: {
      type: String,
      trim: true,
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [0.000001, 'Quantity must be greater than zero'],
    },
    unit: {
      type: String,
      required: [true, 'Unit is required'],
    },
    emissionFactorValue: {
      type: Number,
      required: [true, 'Emission factor snapshot value is required'],
      min: [0.000001, 'Emission factor value must be greater than zero'],
    },
    calculatedEmission: {
      type: Number,
      required: [true, 'Calculated carbon emission is required'],
      min: [0, 'Calculated emission cannot be negative'],
    },
    co2Unit: {
      type: String,
      required: [true, 'CO2 unit is required'],
    },
    calculationMethod: {
      type: String,
      enum: {
        values: ALLOWED_CALCULATION_METHODS,
        message: 'Invalid calculation method',
      },
      default: CALCULATION_METHOD.AUTO,
    },
    transactionDate: {
      type: Date,
      required: [true, 'Transaction date is required'],
      validate: {
        validator: function (value) {
          return value <= new Date();
        },
        message: 'Transaction date cannot be in the future',
      },
    },
    remarks: {
      type: String,
      trim: true,
    },
    approvalStatus: {
      type: String,
      enum: {
        values: ALLOWED_APPROVAL_STATUSES,
        message: 'Invalid approval status',
      },
      default: APPROVAL_STATUS.PENDING,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    approvedAt: {
      type: Date,
      default: null,
    },
    isAutoCalculated: {
      type: Boolean,
      default: true,
    },
    status: {
      type: String,
      enum: {
        values: ALLOWED_TRANSACTION_STATUSES,
        message: 'Invalid status',
      },
      default: TRANSACTION_STATUS.ACTIVE,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
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

// Setup indexes
carbonTransactionSchema.index({ transactionNumber: 1 });
carbonTransactionSchema.index({ department: 1 });
carbonTransactionSchema.index({ transactionDate: 1 });
carbonTransactionSchema.index({ activityType: 1 });
carbonTransactionSchema.index({ status: 1 });
carbonTransactionSchema.index({ approvalStatus: 1 });
carbonTransactionSchema.index({ isDeleted: 1 });

// Compound index
carbonTransactionSchema.index({ department: 1, transactionDate: 1 });

export const CarbonTransaction = mongoose.model('CarbonTransaction', carbonTransactionSchema);
export default CarbonTransaction;
