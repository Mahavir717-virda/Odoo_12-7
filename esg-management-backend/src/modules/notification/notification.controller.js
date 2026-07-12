import { validationResult } from 'express-validator';
import { NotificationService } from './notification.service.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { ApiError } from '../../utils/ApiError.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { HTTP_STATUS } from '../../utils/constants.js';

const notificationService = new NotificationService();

const validateRequest = (req) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMsg = errors.array().map((err) => err.msg).join(', ');
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, errorMsg);
  }
};

const MOCK_USER_ID = '663333333333333333333333';

export class NotificationController {
  getNotifications = asyncHandler(async (req, res) => {
    const userId = req.user?._id || MOCK_USER_ID;
    const list = await notificationService.getUserNotifications(userId);
    res.status(HTTP_STATUS.OK).json(
      new ApiResponse(HTTP_STATUS.OK, list, 'Notifications retrieved successfully')
    );
  });

  getUnreadNotifications = asyncHandler(async (req, res) => {
    const userId = req.user?._id || MOCK_USER_ID;
    const list = await notificationService.getUserNotifications(userId, false);
    res.status(HTTP_STATUS.OK).json(
      new ApiResponse(HTTP_STATUS.OK, list, 'Unread notifications retrieved successfully')
    );
  });

  markRead = asyncHandler(async (req, res) => {
    validateRequest(req);
    const notification = await notificationService.markAsRead(req.params.id);
    res.status(HTTP_STATUS.OK).json(
      new ApiResponse(HTTP_STATUS.OK, notification, 'Notification marked as read')
    );
  });

  markAllRead = asyncHandler(async (req, res) => {
    const userId = req.user?._id || MOCK_USER_ID;
    await notificationService.markAllAsRead(userId);
    res.status(HTTP_STATUS.OK).json(
      new ApiResponse(HTTP_STATUS.OK, null, 'All notifications marked as read')
    );
  });

  deleteNotification = asyncHandler(async (req, res) => {
    validateRequest(req);
    const userId = req.user?._id || MOCK_USER_ID;
    await notificationService.deleteNotification(req.params.id, userId);
    res.status(HTTP_STATUS.OK).json(
      new ApiResponse(HTTP_STATUS.OK, null, 'Notification deleted successfully')
    );
  });

  clearRead = asyncHandler(async (req, res) => {
    const userId = req.user?._id || MOCK_USER_ID;
    await notificationService.clearReadNotifications(userId);
    res.status(HTTP_STATUS.OK).json(
      new ApiResponse(HTTP_STATUS.OK, null, 'All read notifications cleared')
    );
  });

  getPreferences = asyncHandler(async (req, res) => {
    const userId = req.user?._id || MOCK_USER_ID;
    const prefs = await notificationService.getPreferences(userId);
    res.status(HTTP_STATUS.OK).json(
      new ApiResponse(HTTP_STATUS.OK, prefs, 'Notification preferences retrieved')
    );
  });

  updatePreferences = asyncHandler(async (req, res) => {
    validateRequest(req);
    const userId = req.user?._id || MOCK_USER_ID;
    
    // Sync the preference keys from frontend format if applicable
    const body = req.body || {};
    if (body.email_notifications !== undefined) body.email = body.email_notifications;
    if (body.in_app_notifications !== undefined) body.inApp = body.in_app_notifications;
    if (body.challenge_notifications !== undefined) body.challenge = body.challenge_notifications;
    if (body.policy_notifications !== undefined) body.policy = body.policy_notifications;
    if (body.badge_notifications !== undefined) body.badge = body.badge_notifications;
    if (body.audit_notifications !== undefined) body.audit = body.audit_notifications;
    if (body.csr_notifications !== undefined) body.csr = body.csr_notifications;
    
    if (body.compliance_notifications !== undefined) {
      body.compliance = body.compliance_notifications;
      body.issue_notifications = body.compliance_notifications;
    } else if (body.issue_notifications !== undefined) {
      body.compliance = body.issue_notifications;
      body.compliance_notifications = body.issue_notifications;
    }
    
    if (body.reminder_notifications !== undefined) body.reminder = body.reminder_notifications;
    
    if (body.push_notifications !== undefined) {
      body.push = body.push_notifications;
    }

    const prefs = await notificationService.updatePreferences(userId, body);
    res.status(HTTP_STATUS.OK).json(
      new ApiResponse(HTTP_STATUS.OK, prefs, 'Notification preferences updated successfully')
    );
  });

  /**
   * SSE connection endpoint for real-time notification broadcasts
   */
  stream = asyncHandler(async (req, res) => {
    const userId = req.user?._id || req.query.userId || MOCK_USER_ID;

    // Set headers for SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    // Connection acknowledgment
    res.write('data: {"status":"connected"}\n\n');

    notificationService.registerClient(userId.toString(), res);

    const heartbeat = setInterval(() => {
      res.write(': heartbeat\n\n');
    }, 20000);

    req.on('close', () => {
      clearInterval(heartbeat);
      notificationService.unregisterClient(userId.toString(), res);
    });
  });
}
