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
    const prefs = await notificationService.updatePreferences(userId, req.body);
    res.status(HTTP_STATUS.OK).json(
      new ApiResponse(HTTP_STATUS.OK, prefs, 'Notification preferences updated successfully')
    );
  });
}
