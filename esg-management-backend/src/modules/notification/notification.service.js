import mongoose from 'mongoose';
import nodemailer from 'nodemailer';
import { NotificationRepository } from './notification.repository.js';
import { ApiError } from '../../utils/ApiError.js';
import { HTTP_STATUS } from '../../utils/constants.js';

const notificationRepository = new NotificationRepository();

// Global map to hold active SSE client streams: userId -> array of response objects
const sseClients = new Map();

export class NotificationService {
  /**
   * Register a new SSE stream connection for real-time notifications
   */
  registerClient(userId, res) {
    if (!sseClients.has(userId)) {
      sseClients.set(userId, []);
    }
    sseClients.get(userId).push(res);
  }

  /**
   * Unregister / Clean up an active SSE connection
   */
  unregisterClient(userId, res) {
    if (!sseClients.has(userId)) return;
    const clients = sseClients.get(userId);
    const filtered = clients.filter(c => c !== res);
    if (filtered.length === 0) {
      sseClients.delete(userId);
    } else {
      sseClients.set(userId, filtered);
    }
  }

  /**
   * Push a notification in real-time to all active SSE streams of the user
   */
  emitSSE(userId, data) {
    const clients = sseClients.get(userId.toString());
    if (!clients || clients.length === 0) return;
    const payload = `data: ${JSON.stringify(data)}\n\n`;
    clients.forEach(res => {
      try {
        res.write(payload);
      } catch (err) {
        console.error('Error writing to SSE stream:', err.message);
      }
    });
  }

  /**
   * Central entrypoint to publish a notification.
   * Checks preference constraints before saving to database and dispatching.
   */
  async createNotification(notificationData) {
    const { userId, type, module, message } = notificationData;

    // Get recipient preferences
    const preferences = await notificationRepository.getPreferences(userId);

    if (preferences) {
      // If inApp is globally disabled or type checks fail:
      if (preferences.inApp === false || preferences.in_app_notifications === false) {
        // Skip DB save for inApp but check if we need email delivery
      }
      
      const m = (module || '').toLowerCase();
      // Check individual preference keys
      if (m.includes('challenge') && (preferences.challenge === false || preferences.challenge_notifications === false)) return null;
      if (m.includes('badge') && (preferences.badge === false || preferences.badge_notifications === false)) return null;
      if (m.includes('reward') && (preferences.reward === false)) return null;
      if (m.includes('policy') && (preferences.policy === false || preferences.policy_notifications === false)) return null;
      if (m.includes('audit') && (preferences.audit === false || preferences.audit_notifications === false)) return null;
      if (m.includes('compliance') && (preferences.compliance === false || preferences.issue_notifications === false || preferences.compliance_notifications === false)) return null;
      if (m.includes('csr') && (preferences.csr === false || preferences.csr_notifications === false)) return null;
      if (m.includes('reminder') && (preferences.reminder === false || preferences.reminder_notifications === false)) return null;
    }

    const notification = await notificationRepository.create(notificationData);

    // Email delivery check
    if (notification && preferences && (preferences.email !== false && preferences.email_notifications !== false)) {
      try {
        const User = mongoose.model('User');
        const userObj = await User.findById(userId);
        if (userObj && userObj.email) {
          await this.sendNotificationEmail(userObj.email, userObj.name, notification);
        }
      } catch (err) {
        console.error('Failed to resolve email user:', err.message);
      }
    }

    // SSE Push event
    if (notification) {
      this.emitSSE(userId, notification);
    }

    return notification;
  }

  /**
   * Dispatch SMTP or Console log emails
   */
  async sendNotificationEmail(toEmail, toName, notification) {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.ethereal.email',
        port: Number(process.env.SMTP_PORT) || 587,
        auth: {
          user: process.env.SMTP_USER || 'mock-user',
          pass: process.env.SMTP_PASS || 'mock-pass'
        }
      });

      const mailOptions = {
        from: '"EcoSphere ESG" <noreply@ecosphere.com>',
        to: toEmail,
        subject: `[EcoSphere] ${notification.title}`,
        text: `Hello ${toName || 'User'},\n\nThe following notification was triggered from the ${notification.module} module:\n\n${notification.message}\n\nRegards,\nEcoSphere ESG Team`
      };

      if (process.env.SMTP_USER && process.env.SMTP_USER !== 'mock-user') {
        await transporter.sendMail(mailOptions);
      } else {
        console.log(`[EMAIL DISPATCH TO ${toEmail}]: Subject: "${mailOptions.subject}" - Body: "${mailOptions.text}"`);
      }
    } catch (err) {
      console.error('Nodemailer error:', err.message);
    }
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

  async markAllAsRead(userId) {
    return await notificationRepository.markAllAsRead(userId);
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
