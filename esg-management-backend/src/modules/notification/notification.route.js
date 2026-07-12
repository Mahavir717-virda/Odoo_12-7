import { Router } from 'express';
import { NotificationController } from './notification.controller.js';
import { getNotificationByIdValidation, updatePreferencesValidation } from './notification.validation.js';

const router = Router();
const controller = new NotificationController();

router.get('/', controller.getNotifications);
router.get('/stream', controller.stream);
router.get('/unread', controller.getUnreadNotifications);
router.patch('/read-all', controller.markAllRead);
router.patch('/:id/read', getNotificationByIdValidation, controller.markRead);
router.delete('/read', controller.clearRead);
router.delete('/:id', getNotificationByIdValidation, controller.deleteNotification);

router
  .route('/preferences')
  .get(controller.getPreferences)
  .patch(updatePreferencesValidation, controller.updatePreferences);

export default router;
