import mongoose from 'mongoose';
import { Policy } from './policy.model.js';
import { PolicyAcknowledgement } from './policyAcknowledgement.model.js';
import { NotificationService } from '../notification/notification.service.js';

const notificationService = new NotificationService();

export async function runPolicyReminderJob() {
  try {
    console.log('[POLICY REMINDER JOB] Starting check...');
    const User = mongoose.model('User');
    
    // 1. Get all published policies
    const policies = await Policy.find({ status: 'Published' });
    const employees = await User.find({ role: { $ne: 'Admin' } }); // notify non-admins

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (const policy of policies) {
      // Due Date defaults to effectiveDate + 10 days
      const dueDate = new Date(policy.expiryDate || new Date(policy.effectiveDate.getTime() + 10 * 24 * 3600 * 1000));
      dueDate.setHours(0, 0, 0, 0);

      // Check difference in days
      const timeDiff = dueDate.getTime() - today.getTime();
      const diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));

      // Filter employees by department if policy specifies one
      const targetEmployees = employees.filter(emp => {
        if (!policy.department || policy.department === 'All') return true;
        // Check both name and ObjectId
        return emp.department?.toString() === policy.department.toString();
      });

      for (const emp of targetEmployees) {
        // Check if employee has acknowledged this policy
        const ack = await PolicyAcknowledgement.findOne({
          policyId: policy._id,
          employeeId: emp._id
        });

        if (!ack) {
          // Unacknowledged! Check notification triggers
          if (diffDays === 3) {
            // Due date - 3 reminder
            await notificationService.createNotification({
              userId: emp._id,
              title: 'Policy Reminder',
              message: `Reminder: "${policy.title || 'Supplier Code Policy'}" - Please acknowledge before ${dueDate.toLocaleDateString()}`,
              module: 'Governance',
              referenceId: policy._id,
              priority: 'High',
              type: 'INFO'
            });
            console.log(`[POLICY REMINDER JOB] Sent reminder to ${emp.email} for ${policy.title}`);
          } else if (diffDays < 0) {
            // Overdue reminder
            await notificationService.createNotification({
              userId: emp._id,
              title: 'Policy Overdue',
              message: `Policy "${policy.title}" is overdue! Please complete immediately.`,
              module: 'Governance',
              referenceId: policy._id,
              priority: 'High',
              type: 'INFO'
            });
            console.log(`[POLICY REMINDER JOB] Sent overdue alert to ${emp.email} for ${policy.title}`);
          }
        }
      }
    }
    console.log('[POLICY REMINDER JOB] Completed check.');
  } catch (err) {
    console.error('[POLICY REMINDER JOB] Error running policy reminders:', err.message);
  }
}

// Start interval runner
export function startPolicyReminderScheduler() {
  // Run immediately on startup
  setTimeout(runPolicyReminderJob, 10000);
  // Then run every 24 hours
  setInterval(runPolicyReminderJob, 24 * 3600 * 1000);
}
