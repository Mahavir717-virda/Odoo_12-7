import mongoose from 'mongoose';
import { ALLOWED_NOTIFICATION_TYPES, ALLOWED_NOTIFICATION_PRIORITIES, NOTIFICATION_PRIORITY, NOTIFICATION_TYPE } from './notification.constants.js';

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
    },
    title: {
      type: String,
      required: [true, 'Notification title is required'],
      trim: true,
    },
    message: {
      type: String,
      required: [true, 'Notification message is required'],
      trim: true,
    },
    type: {
      type: String,
      enum: {
        values: ALLOWED_NOTIFICATION_TYPES,
        message: 'Invalid notification type',
      },
      default: NOTIFICATION_TYPE.INFO,
    },
    module: {
      type: String,
      required: [true, 'Origin module is required'],
      trim: true,
    },
    referenceId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    priority: {
      type: String,
      enum: {
        values: ALLOWED_NOTIFICATION_PRIORITIES,
        message: 'Priority must be Low, Normal, or High',
      },
      default: NOTIFICATION_PRIORITY.NORMAL,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

notificationSchema.index({ userId: 1, isRead: 1 });

export const Notification = mongoose.models.Notification || mongoose.model('Notification', notificationSchema);
