import mongoose from 'mongoose';

const diversitySchema = new mongoose.Schema(
  {
    genderFemalePercentage: { type: Number, default: 48 },
    genderMalePercentage: { type: Number, default: 50 },
    genderOtherPercentage: { type: Number, default: 2 },
    veteranPercentage: { type: Number, default: 5.4 },
    activeInclusionPrograms: { type: Number, default: 8 }
  },
  {
    timestamps: true,
  }
);

export const Diversity = mongoose.models.Diversity || mongoose.model('Diversity', diversitySchema);
