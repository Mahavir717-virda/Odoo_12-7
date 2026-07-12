import { Notification } from './notification.model.js';
import { NotificationPreference } from './notificationPreference.model.js';

export class NotificationRepository {
  async create(notificationData) {
    return await Notification.create(notificationData);
  }

  async findByUserId(userId, isRead) {
    const query = { userId };
    if (isRead !== undefined) query.isRead = isRead;
    return await Notification.find(query).sort({ createdAt: -1 });
  }

  async updateReadStatus(id, isRead) {
    return await Notification.findByIdAndUpdate(
      id,
      { $set: { isRead, readAt: isRead ? new Date() : null } },
      { new: true }
    );
  }

  async delete(id, userId) {
    return await Notification.findOneAndDelete({ _id: id, userId });
  }

  async deleteRead(userId) {
    return await Notification.deleteMany({ userId, isRead: true });
  }

  async getPreferences(userId) {
    return await NotificationPreference.findOneAndUpdate(
      { userId },
      { $setOnInsert: { userId } },
      { new: true, upsert: true }
    );
  }

  async updatePreferences(userId, preferences) {
    return await NotificationPreference.findOneAndUpdate(
      { userId },
      { $set: preferences },
      { new: true, runValidators: true }
    );
  }
}
