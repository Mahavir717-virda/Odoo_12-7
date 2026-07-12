import mongoose from 'mongoose';

const notificationPreferenceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      unique: true,
    },
    // Standard keys
    challenge: { type: Boolean, default: true },
    badge: { type: Boolean, default: true },
    reward: { type: Boolean, default: true },
    policy: { type: Boolean, default: true },
    audit: { type: Boolean, default: true },
    compliance: { type: Boolean, default: true },
    csr: { type: Boolean, default: true },
    reminder: { type: Boolean, default: true },
    email: { type: Boolean, default: true },
    inApp: { type: Boolean, default: true },
    push: { type: Boolean, default: false },

    // Frontend keys
    email_notifications: { type: Boolean, default: true },
    in_app_notifications: { type: Boolean, default: true },
    challenge_notifications: { type: Boolean, default: true },
    policy_notifications: { type: Boolean, default: true },
    badge_notifications: { type: Boolean, default: true },
    audit_notifications: { type: Boolean, default: true },
    csr_notifications: { type: Boolean, default: true },
    issue_notifications: { type: Boolean, default: true },
    compliance_notifications: { type: Boolean, default: true },
    reminder_notifications: { type: Boolean, default: true },
    push_notifications: { type: Boolean, default: false }
  },
  {
    timestamps: true,
  }
);

export const NotificationPreference = mongoose.models.NotificationPreference || mongoose.model('NotificationPreference', notificationPreferenceSchema);
