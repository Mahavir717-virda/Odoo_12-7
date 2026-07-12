import { NotificationRepository } from './notification.repository.js';
import { ApiError } from '../../utils/ApiError.js';
import { HTTP_STATUS } from '../../utils/constants.js';

const notificationRepository = new NotificationRepository();

export class NotificationService {
  /**
   * Central entrypoint to publish a notification.
   * Checks preference constraints before saving to database.
   */
  async createNotification(notificationData) {
    const { userId, type } = notificationData;

    // Get recipient preferences
    const preferences = await notificationRepository.getPreferences(userId);

    // Map notification type to preference key
    const typeKey = type.toLowerCase();
    
    // If the preference exists and is disabled, skip creation
    if (preferences && preferences[typeKey] === false) {
      return null;
    }

    return await notificationRepository.create(notificationData);
  }

  async getUserNotifications(userId, isRead) {
    return await notificationRepository.findByUserId(userId, isRead);
  }

  async markAsRead(notificationId) {
    const notification = await notificationRepository.updateReadStatus(notificationId, true);
    if (!notification) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Notification not found');
    }
    return notification;
  }

  async deleteNotification(notificationId, userId) {
    const notification = await notificationRepository.delete(notificationId, userId);
    if (!notification) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Notification not found or access denied');
    }
    return notification;
  }

  async clearReadNotifications(userId) {
    return await notificationRepository.deleteRead(userId);
  }

  async getPreferences(userId) {
    return await notificationRepository.getPreferences(userId);
  }

  async updatePreferences(userId, preferences) {
    return await notificationRepository.updatePreferences(userId, preferences);
  }
}
