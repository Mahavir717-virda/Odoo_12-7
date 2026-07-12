import { ReportService } from './report.service.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { HTTP_STATUS } from '../../utils/constants.js';
import { ReportType, ReportTemplate, ReportSchedule, ReportHistory } from './report.model.js';

const reportService = new ReportService();

const getReportDataByType = async (reportType, filters) => {
  switch (reportType) {
    case 'Environmental':
    case 'Environmental Report':
      return await reportService.getEnvironmentalReport(filters);
    case 'Social':
    case 'Social Report':
      return await reportService.getSocialReport(filters);
    case 'Governance':
    case 'Governance Report':
      return await reportService.getGovernanceReport(filters);
    case 'ESG Summary':
      return await reportService.getEsgSummaryReport(filters);
    case 'Challenges':
      return await reportService.getChallengeReport(filters);
    case 'Compliance':
      return await reportService.getComplianceReport(filters);
    case 'Policies':
      return await reportService.getPolicyReport(filters);
    case 'Audits':
      return await reportService.getAuditReport(filters);
    case 'Employees':
      return await reportService.getEmployeeReport(filters);
    default:
      return null;
  }
};

export class ReportController {
  getEnvironmental = asyncHandler(async (req, res) => {
    const report = await reportService.getEnvironmentalReport(req.query);
    res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, report, 'Environmental report generated'));
  });

  getSocial = asyncHandler(async (req, res) => {
    const report = await reportService.getSocialReport(req.query);
    res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, report, 'Social report generated'));
  });

  getGovernance = asyncHandler(async (req, res) => {
    const report = await reportService.getGovernanceReport(req.query);
    res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, report, 'Governance report generated'));
  });

  getEsgSummary = asyncHandler(async (req, res) => {
    const report = await reportService.getEsgSummaryReport(req.query);
    res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, report, 'ESG summary report generated'));
  });

  getChallenges = asyncHandler(async (req, res) => {
    const report = await reportService.getChallengeReport(req.query);
    res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, report, 'Challenges report generated'));
  });

  getCompliance = asyncHandler(async (req, res) => {
    const report = await reportService.getComplianceReport(req.query);
    res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, report, 'Compliance report generated'));
  });

  getPolicies = asyncHandler(async (req, res) => {
    const report = await reportService.getPolicyReport(req.query);
    res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, report, 'Policies report generated'));
  });

  getAudits = asyncHandler(async (req, res) => {
    const report = await reportService.getAuditReport(req.query);
    res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, report, 'Audits report generated'));
  });

  getEmployees = asyncHandler(async (req, res) => {
    const report = await reportService.getEmployeeReport(req.query);
    res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, report, 'Employee report generated'));
  });

  // Modules metadata
  getModules = asyncHandler(async (req, res) => {
    const modules = [
      { id: 'environmental', name: 'Environmental', label: 'Environmental' },
      { id: 'social', name: 'Social', label: 'Social' },
      { id: 'governance', name: 'Governance', label: 'Governance' },
      { id: 'gamification', name: 'Gamification', label: 'Gamification' },
      { id: 'settings', name: 'Settings', label: 'Settings' },
      { id: 'audit', name: 'Audit', label: 'Audit' },
      { id: 'challenges', name: 'Challenges', label: 'Challenges' },
      { id: 'csr', name: 'CSR', label: 'CSR' },
      { id: 'rewards', name: 'Rewards', label: 'Rewards' }
    ];
    res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, modules, 'Report modules retrieved'));
  });

  // Custom Report Builder
  getCustomReport = asyncHandler(async (req, res) => {
    const report = await reportService.getCustomReport(req.body);
    res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, report, 'Custom report generated'));
  });

  // Employee-specific Personal Summary
  getMySummary = asyncHandler(async (req, res) => {
    const email = req.query.email || (req.user && req.user.email) || 'employee@ecosphere.com';
    const summary = await reportService.getMySummary(email);
    res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, summary, 'Personal summary retrieved'));
  });

  // Report Types CRUD
  getReportTypes = asyncHandler(async (req, res) => {
    const types = await ReportType.find().sort({ sortOrder: 1 });
    res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, types, 'Report types retrieved'));
  });

  createReportType = asyncHandler(async (req, res) => {
    const type = await ReportType.create(req.body);
    res.status(HTTP_STATUS.CREATED).json(new ApiResponse(HTTP_STATUS.CREATED, type, 'Report type created'));
  });

  updateReportType = asyncHandler(async (req, res) => {
    const type = await ReportType.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, type, 'Report type updated'));
  });

  deleteReportType = asyncHandler(async (req, res) => {
    await ReportType.findByIdAndDelete(req.params.id);
    res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, null, 'Report type deleted'));
  });

  // Templates CRUD
  getTemplates = asyncHandler(async (req, res) => {
    const templates = await ReportTemplate.find().sort({ createdAt: -1 });
    res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, templates, 'Templates retrieved'));
  });

  createTemplate = asyncHandler(async (req, res) => {
    const template = await ReportTemplate.create(req.body);
    res.status(HTTP_STATUS.CREATED).json(new ApiResponse(HTTP_STATUS.CREATED, template, 'Template saved'));
  });

  updateTemplate = asyncHandler(async (req, res) => {
    const template = await ReportTemplate.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, template, 'Template updated'));
  });

  deleteTemplate = asyncHandler(async (req, res) => {
    await ReportTemplate.findByIdAndDelete(req.params.id);
    res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, null, 'Template deleted'));
  });

  // Schedules CRUD
  getSchedules = asyncHandler(async (req, res) => {
    const schedules = await ReportSchedule.find().populate('templateId').sort({ createdAt: -1 });
    res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, schedules, 'Schedules retrieved'));
  });

  createSchedule = asyncHandler(async (req, res) => {
    const schedule = await ReportSchedule.create(req.body);
    res.status(HTTP_STATUS.CREATED).json(new ApiResponse(HTTP_STATUS.CREATED, schedule, 'Schedule created'));
  });

  deleteSchedule = asyncHandler(async (req, res) => {
    await ReportSchedule.findByIdAndDelete(req.params.id);
    res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, null, 'Schedule deleted'));
  });

  // History CRUD
  getHistory = asyncHandler(async (req, res) => {
    const history = await ReportHistory.find().sort({ createdAt: -1 });
    res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, history, 'Report generation history retrieved'));
  });

  createHistory = asyncHandler(async (req, res) => {
    const item = await ReportHistory.create(req.body);
    res.status(HTTP_STATUS.CREATED).json(new ApiResponse(HTTP_STATUS.CREATED, item, 'History logged'));
  });

  // Export handlers
  exportPDF = asyncHandler(async (req, res) => {
    const { reportType, filters = {} } = req.body;
    const report = await getReportDataByType(reportType, filters);
    if (!report) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(new ApiResponse(HTTP_STATUS.BAD_REQUEST, null, 'Invalid report type'));
    }

    const dataRows = Array.isArray(report.data) ? report.data : [report.data];
    const plainData = dataRows.map(d => (d.toJSON ? d.toJSON() : d));
    const pdfText = reportService.convertToPDFText(`${reportType} Report`, plainData);

    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Disposition', `attachment; filename="${reportType.toLowerCase()}_report.pdf"`);
    res.status(HTTP_STATUS.OK).send(Buffer.from(pdfText));
  });

  exportExcel = asyncHandler(async (req, res) => {
    const { reportType, filters = {} } = req.body;
    const report = await getReportDataByType(reportType, filters);
    if (!report) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(new ApiResponse(HTTP_STATUS.BAD_REQUEST, null, 'Invalid report type'));
    }

    const dataRows = Array.isArray(report.data) ? report.data : [report.data];
    const plainData = dataRows.map(d => (d.toJSON ? d.toJSON() : d));
    const excelHTML = reportService.convertToExcelHTML(`${reportType} Report`, plainData);

    res.setHeader('Content-Type', 'application/vnd.ms-excel');
    res.setHeader('Content-Disposition', `attachment; filename="${reportType.toLowerCase()}_report.xls"`);
    res.status(HTTP_STATUS.OK).send(Buffer.from(excelHTML));
  });

  exportCSV = asyncHandler(async (req, res) => {
    const { reportType, filters = {} } = req.body;
    const report = await getReportDataByType(reportType, filters);
    if (!report) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(new ApiResponse(HTTP_STATUS.BAD_REQUEST, null, 'Invalid report type'));
    }

    const dataRows = Array.isArray(report.data) ? report.data : [report.data];
    const plainData = dataRows.map(d => (d.toJSON ? d.toJSON() : d));
    const csvContent = reportService.convertToCSV(plainData);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${reportType.toLowerCase()}_report.csv"`);
    res.status(HTTP_STATUS.OK).send(csvContent);
  });
}
