import mongoose from 'mongoose';

export class ReportService {
  buildDateQuery(startDate, endDate) {
    const dateQuery = {};
    if (startDate) dateQuery.$gte = new Date(startDate);
    if (endDate) dateQuery.$lte = new Date(endDate);
    return Object.keys(dateQuery).length > 0 ? dateQuery : null;
  }

  async getEnvironmentalReport(filters) {
    const CarbonTransaction = mongoose.models.CarbonTransaction;
    const EmissionFactor = mongoose.models.EmissionFactor;
    const query = {};

    const dateQ = this.buildDateQuery(filters.startDate, filters.endDate);
    if (dateQ) query.transactionDate = dateQ;
    if (filters.department) query.department = filters.department;

    let transactions = [];
    if (CarbonTransaction) {
      transactions = await CarbonTransaction.find(query)
        .populate('emissionFactorId', 'name factor category')
        .sort({ transactionDate: -1 });
    }

    return {
      reportType: 'Environmental (Carbon Footprint)',
      generatedAt: new Date(),
      filters,
      data: transactions,
    };
  }

  async getSocialReport(filters) {
    const CSR = mongoose.models.CSR;
    const Participation = mongoose.models.Participation;
    const query = {};

    const dateQ = this.buildDateQuery(filters.startDate, filters.endDate);
    if (dateQ) query.startDate = dateQ;
    if (filters.department) query.department = filters.department;

    let csrProjects = [];
    if (CSR) {
      csrProjects = await CSR.find(query).sort({ startDate: -1 });
    }

    return {
      reportType: 'Social (CSR & Initiatives)',
      generatedAt: new Date(),
      filters,
      data: csrProjects,
    };
  }

  async getGovernanceReport(filters) {
    const Policy = mongoose.models.Policy || mongoose.model('Policy');
    const Audit = mongoose.models.Audit || mongoose.model('Audit');

    const policyQuery = {};
    const auditQuery = {};

    const dateQ = this.buildDateQuery(filters.startDate, filters.endDate);
    if (dateQ) {
      policyQuery.effectiveDate = dateQ;
      auditQuery.scheduledDate = dateQ;
    }
    if (filters.department) {
      policyQuery.department = filters.department;
      auditQuery.department = filters.department;
    }

    const [policies, audits] = await Promise.all([
      Policy.find(policyQuery).sort({ effectiveDate: -1 }),
      Audit.find(auditQuery).populate('auditor', 'name email').sort({ scheduledDate: -1 }),
    ]);

    return {
      reportType: 'Governance (Policies & Audits)',
      generatedAt: new Date(),
      filters,
      data: {
        policies,
        audits,
      },
    };
  }

  async getEsgSummaryReport(filters) {
    const [env, soc, gov] = await Promise.all([
      this.getEnvironmentalReport(filters),
      this.getSocialReport(filters),
      this.getGovernanceReport(filters),
    ]);

    return {
      reportType: 'Comprehensive ESG Summary',
      generatedAt: new Date(),
      filters,
      summary: {
        carbonTransactionsCount: env.data.length,
        csrProjectsCount: soc.data.length,
        policiesCount: gov.data.policies.length,
        auditsCount: gov.data.audits.length,
      },
    };
  }

  async getChallengeReport(filters) {
    const Challenge = mongoose.model('Challenge');
    const ChallengeParticipant = mongoose.models.ChallengeParticipant || mongoose.model('ChallengeParticipant');
    const query = {};

    const dateQ = this.buildDateQuery(filters.startDate, filters.endDate);
    if (dateQ) query.startDate = dateQ;
    if (filters.category) query.category = filters.category;
    if (filters.status) query.status = filters.status;

    const challenges = await Challenge.find(query).sort({ startDate: -1 });

    const challengeStats = await Promise.all(
      challenges.map(async (challenge) => {
        const participantsCount = await ChallengeParticipant.countDocuments({ challengeId: challenge._id });
        const completedCount = await ChallengeParticipant.countDocuments({ challengeId: challenge._id, status: 'COMPLETED' });
        return {
          name: challenge.name,
          category: challenge.category,
          xpReward: challenge.xpReward,
          pointsReward: challenge.pointsReward,
          participantsCount,
          completedCount,
          status: challenge.status,
        };
      })
    );

    return {
      reportType: 'Challenges Performance',
      generatedAt: new Date(),
      filters,
      data: challengeStats,
    };
  }

  async getComplianceReport(filters) {
    const Compliance = mongoose.models.Compliance || mongoose.model('Compliance');
    const query = {};

    const dateQ = this.buildDateQuery(filters.startDate, filters.endDate);
    if (dateQ) query.dueDate = dateQ;
    if (filters.department) query.department = filters.department;
    if (filters.status) query.status = filters.status;
    if (filters.severity) query.severity = filters.severity;

    const compliances = await Compliance.find(query)
      .populate('assignedTo', 'name email')
      .populate('reportedBy', 'name email')
      .sort({ dueDate: -1 });

    return {
      reportType: 'Compliance Issues Summary',
      generatedAt: new Date(),
      filters,
      data: compliances,
    };
  }

  async getPolicyReport(filters) {
    const Policy = mongoose.models.Policy || mongoose.model('Policy');
    const query = {};

    const dateQ = this.buildDateQuery(filters.startDate, filters.endDate);
    if (dateQ) query.effectiveDate = dateQ;
    if (filters.department) query.department = filters.department;
    if (filters.status) query.status = filters.status;

    const policies = await Policy.find(query).sort({ effectiveDate: -1 });

    return {
      reportType: 'Policies Publications',
      generatedAt: new Date(),
      filters,
      data: policies,
    };
  }

  async getAuditReport(filters) {
    const Audit = mongoose.models.Audit || mongoose.model('Audit');
    const query = {};

    const dateQ = this.buildDateQuery(filters.startDate, filters.endDate);
    if (dateQ) query.scheduledDate = dateQ;
    if (filters.department) query.department = filters.department;
    if (filters.status) query.status = filters.status;

    const audits = await Audit.find(query).populate('auditor', 'name email').sort({ scheduledDate: -1 });

    return {
      reportType: 'Audits Scheduled',
      generatedAt: new Date(),
      filters,
      data: audits,
    };
  }

  async getEmployeeReport(filters) {
    const User = mongoose.model('User');
    const query = {};
    if (filters.department) query.department = filters.department;

    const employees = await User.find(query)
      .sort({ xp: -1 })
      .select('name email xp points department');

    return {
      reportType: 'Employee ESG Scoreboard',
      generatedAt: new Date(),
      filters,
      data: employees,
    };
  }

  convertToCSV(jsonData) {
    if (!jsonData || jsonData.length === 0) return 'No data available';
    
    // Extract headers
    const keys = Object.keys(jsonData[0]);
    const csvRows = [keys.join(',')];

    for (const row of jsonData) {
      const values = keys.map(key => {
        let val = row[key];
        if (val === null || val === undefined) return '';
        if (typeof val === 'object') val = JSON.stringify(val);
        // Escape quotes
        val = val.toString().replace(/"/g, '""');
        return `"${val}"`;
      });
      csvRows.push(values.join(','));
    }

    return csvRows.join('\n');
  }

  convertToExcelHTML(reportTitle, jsonData) {
    if (!jsonData || jsonData.length === 0) return 'No data available';

    const keys = Object.keys(jsonData[0]);
    let html = `<html><head><meta charset="utf-8"/></head><body><h2>${reportTitle}</h2><table border="1"><thead><tr>`;
    
    keys.forEach(k => { html += `<th>${k}</th>`; });
    html += '</tr></thead><tbody>';

    for (const row of jsonData) {
      html += '<tr>';
      keys.forEach(key => {
        let val = row[key];
        if (val === null || val === undefined) val = '';
        if (typeof val === 'object') val = JSON.stringify(val);
        html += `<td>${val}</td>`;
      });
      html += '</tr>';
    }

    html += '</tbody></table></body></html>';
    return html;
  }

  convertToPDFText(reportTitle, jsonData) {
    // Standard structured text preview for dynamic reports
    let report = `=========================================\n`;
    report += `          ${reportTitle.toUpperCase()}          \n`;
    report += `=========================================\n`;
    report += `Generated At: ${new Date().toISOString()}\n\n`;

    if (!jsonData || jsonData.length === 0) {
      report += 'No records found matching filters.\n';
      return report;
    }

    const keys = Object.keys(jsonData[0]);
    report += `Total Records: ${jsonData.length}\n\n`;

    for (let i = 0; i < jsonData.length; i++) {
      report += `--- Record ${i + 1} ---\n`;
      keys.forEach(key => {
        let val = jsonData[i][key];
        if (typeof val === 'object') val = JSON.stringify(val);
        report += `${key}: ${val}\n`;
      });
      report += `\n`;
    }
    return report;
  }
}
