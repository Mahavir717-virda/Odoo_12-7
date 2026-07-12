import { ReportService } from './report.service.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { HTTP_STATUS } from '../../utils/constants.js';

const reportService = new ReportService();

const getReportDataByType = async (reportType, filters) => {
  switch (reportType) {
    case 'Environmental':
      return await reportService.getEnvironmentalReport(filters);
    case 'Social':
      return await reportService.getSocialReport(filters);
    case 'Governance':
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
