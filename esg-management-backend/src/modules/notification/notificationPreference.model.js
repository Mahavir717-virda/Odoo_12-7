import mongoose from 'mongoose';

const notificationPreferenceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      unique: true,
    },
    challenge: {
      type: Boolean,
      default: true,
    },
    badge: {
      type: Boolean,
      default: true,
    },
    reward: {
      type: Boolean,
      default: true,
    },
    policy: {
      type: Boolean,
      default: true,
    },
    audit: {
      type: Boolean,
      default: true,
    },
    compliance: {
      type: Boolean,
      default: true,
    },
    email: {
      type: Boolean,
      default: true,
    },
    inApp: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export const NotificationPreference = mongoose.models.NotificationPreference || mongoose.model('NotificationPreference', notificationPreferenceSchema);
