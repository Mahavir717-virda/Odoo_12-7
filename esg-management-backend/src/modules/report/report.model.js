import mongoose from 'mongoose';

const reportTypeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  icon: { type: String, default: 'leaf' },
  description: { type: String },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  allowedRoles: [{ type: String }],
  category: { type: String, default: 'General' },
  sortOrder: { type: Number, default: 0 }
}, { timestamps: true });

const reportTemplateSchema = new mongoose.Schema({
  templateName: { type: String, required: true },
  configurationJson: { type: mongoose.Schema.Types.Mixed, required: true },
  createdBy: { type: String } // Storing username or email for flexibility
}, { timestamps: true });

const reportScheduleSchema = new mongoose.Schema({
  cadence: { type: String, required: true },
  recipientEmails: [{ type: String }],
  time: { type: String },
  reportType: { type: String },
  templateId: { type: mongoose.Schema.Types.ObjectId, ref: 'ReportTemplate' },
  createdBy: { type: String }
}, { timestamps: true });

const reportHistorySchema = new mongoose.Schema({
  user: { type: String },
  reportType: { type: String },
  filters: { type: mongoose.Schema.Types.Mixed },
  exportType: { type: String },
  ip: { type: String },
  browser: { type: String },
  duration: { type: Number },
  status: { type: String, default: 'success' }
}, { timestamps: true });

export const ReportType = mongoose.models.ReportType || mongoose.model('ReportType', reportTypeSchema);
export const ReportTemplate = mongoose.models.ReportTemplate || mongoose.model('ReportTemplate', reportTemplateSchema);
export const ReportSchedule = mongoose.models.ReportSchedule || mongoose.model('ReportSchedule', reportScheduleSchema);
export const ReportHistory = mongoose.models.ReportHistory || mongoose.model('ReportHistory', reportHistorySchema);
