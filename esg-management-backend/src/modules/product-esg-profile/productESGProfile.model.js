import mongoose from 'mongoose';
import {
  ALLOWED_PROFILE_STATUSES,
  ALLOWED_MATERIAL_TYPES,
  ALLOWED_PRODUCT_TYPES,
  ALLOWED_LIFECYCLE_STAGES,
  ALLOWED_WEIGHT_UNITS,
  PROFILE_STATUS,
  CARBON_CATEGORY,
} from './productESGProfile.constants.js';

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

const productESGProfileSchema = new mongoose.Schema(
  {
    productCode: {
      type: String,
      required: [true, 'Product code is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    productName: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      minlength: [3, 'Product name must be at least 3 characters'],
      maxlength: [100, 'Product name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      trim: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: [true, 'Department reference is required'],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category reference is required'],
    },
    emissionFactor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'EmissionFactor',
      required: [true, 'Emission factor reference is required'],
    },
    materialType: {
      type: String,
      required: [true, 'Material type is required'],
      enum: {
        values: ALLOWED_MATERIAL_TYPES,
        message: 'Invalid material type',
      },
    },
    productType: {
      type: String,
      required: [true, 'Product type is required'],
      enum: {
        values: ALLOWED_PRODUCT_TYPES,
        message: 'Invalid product type',
      },
    },
    lifecycleStage: {
      type: String,
      required: [true, 'Lifecycle stage is required'],
      enum: {
        values: ALLOWED_LIFECYCLE_STAGES,
        message: 'Invalid lifecycle stage',
      },
    },
    recyclabilityPercentage: {
      type: Number,
      required: [true, 'Recyclability percentage is required'],
      min: [0, 'Recyclability percentage cannot be less than 0'],
      max: [100, 'Recyclability percentage cannot exceed 100'],
    },
    recycledContentPercentage: {
      type: Number,
      required: [true, 'Recycled content percentage is required'],
      min: [0, 'Recycled content percentage cannot be less than 0'],
      max: [100, 'Recycled content percentage cannot exceed 100'],
    },
    hazardousMaterial: {
      type: Boolean,
      default: false,
    },
    renewableMaterial: {
      type: Boolean,
      default: false,
    },
    packagingWeight: {
      type: Number,
      required: [true, 'Packaging weight is required'],
      min: [0, 'Packaging weight cannot be less than 0'],
    },
    productWeight: {
      type: Number,
      required: [true, 'Product weight is required'],
      min: [0.000001, 'Product weight must be greater than 0'],
    },
    weightUnit: {
      type: String,
      required: [true, 'Weight unit is required'],
      enum: {
        values: ALLOWED_WEIGHT_UNITS,
        message: 'Invalid weight unit',
      },
    },
    countryOfOrigin: {
      type: String,
      trim: true,
      uppercase: true,
      required: [true, 'Country of origin is required'],
    },
    manufacturer: {
      type: String,
      trim: true,
      required: [true, 'Manufacturer details are required'],
    },
    supplier: {
      type: String,
      trim: true,
      required: [true, 'Supplier details are required'],
    },
    estimatedLifeYears: {
      type: Number,
      required: [true, 'Estimated life years is required'],
      min: [0, 'Estimated life years cannot be less than 0'],
    },
    isCarbonNeutral: {
      type: Boolean,
      default: false,
    },
    carbonNeutralCertificate: {
      type: String,
      trim: true,
      default: null,
    },
    status: {
      type: String,
      enum: {
        values: ALLOWED_PROFILE_STATUSES,
        message: 'Invalid status',
      },
      default: PROFILE_STATUS.ACTIVE,
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
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual field: isRecyclable
productESGProfileSchema.virtual('isRecyclable').get(function () {
  return this.recyclabilityPercentage >= 50;
});

// Virtual field: carbonCategory
productESGProfileSchema.virtual('carbonCategory').get(function () {
  if (!this.emissionFactor || !this.emissionFactor.emissionValue) {
    return null;
  }
  const value = this.emissionFactor.emissionValue;
  if (value < 0.2) {
    return CARBON_CATEGORY.LOW;
  } else if (value <= 1.0) {
    return CARBON_CATEGORY.MEDIUM;
  } else {
    return CARBON_CATEGORY.HIGH;
  }
});

// Setup indexes
productESGProfileSchema.index({ productCode: 1 });
productESGProfileSchema.index({ productName: 1 });
productESGProfileSchema.index({ department: 1 });
productESGProfileSchema.index({ category: 1 });
productESGProfileSchema.index({ emissionFactor: 1 });
productESGProfileSchema.index({ status: 1 });
productESGProfileSchema.index({ isDeleted: 1 });

// Compound index
productESGProfileSchema.index({ department: 1, category: 1 });

export const ProductESGProfile = mongoose.model('ProductESGProfile', productESGProfileSchema);
