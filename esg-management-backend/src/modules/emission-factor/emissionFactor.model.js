import mongoose from 'mongoose';
import {
  ALLOWED_SOURCE_TYPES,
  ALLOWED_UNIT_TYPES,
  ALLOWED_CO2_UNITS,
  ALLOWED_EMISSION_STATUSES,
  EMISSION_STATUS,
} from './emissionFactor.constants.js';

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

const emissionFactorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Emission factor name is required'],
      trim: true,
      minlength: [3, 'Name must be at least 3 characters'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    code: {
      type: String,
      required: [true, 'Emission factor code is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    description: {
      type: String,
      trim: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category reference is required'],
    },
    sourceType: {
      type: String,
      required: [true, 'Source type is required'],
      enum: {
        values: ALLOWED_SOURCE_TYPES,
        message: 'Invalid source type',
      },
    },
    unit: {
      type: String,
      required: [true, 'Unit type is required'],
      enum: {
        values: ALLOWED_UNIT_TYPES,
        message: 'Invalid unit type',
      },
    },
    emissionValue: {
      type: Number,
      required: [true, 'Emission value is required'],
      min: [0.000001, 'Emission value must be greater than zero'],
    },
    co2Unit: {
      type: String,
      required: [true, 'CO2 unit is required'],
      enum: {
        values: ALLOWED_CO2_UNITS,
        message: 'Invalid CO2 unit',
      },
    },
    effectiveFrom: {
      type: Date,
      required: [true, 'Effective from date is required'],
    },
    effectiveTo: {
      type: Date,
      default: null,
    },
    country: {
      type: String,
      trim: true,
      uppercase: true,
      required: [true, 'Country is required'],
    },
    region: {
      type: String,
      trim: true,
      uppercase: true,
      required: [true, 'Region is required'],
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: {
        values: ALLOWED_EMISSION_STATUSES,
        message: 'Invalid status',
      },
      default: EMISSION_STATUS.ACTIVE,
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

// Standard indexes for search & sorting optimization
emissionFactorSchema.index({ code: 1 });
emissionFactorSchema.index({ sourceType: 1 });
emissionFactorSchema.index({ status: 1 });
emissionFactorSchema.index({ country: 1 });
emissionFactorSchema.index({ region: 1 });
emissionFactorSchema.index({ effectiveFrom: 1 });
emissionFactorSchema.index({ category: 1 });
emissionFactorSchema.index({ isDeleted: 1 });

// Compound index for querying unique default factor combinations
emissionFactorSchema.index({ sourceType: 1, unit: 1, country: 1, region: 1 });

export const EmissionFactor = mongoose.model('EmissionFactor', emissionFactorSchema);
