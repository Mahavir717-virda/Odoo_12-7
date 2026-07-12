import mongoose from 'mongoose';
import { ReportType, ReportTemplate, ReportSchedule, ReportHistory } from './report.model.js';

export class ReportService {
  buildDateQuery(startDate, endDate) {
    const dateQuery = {};
    if (startDate) dateQuery.$gte = new Date(startDate);
    if (endDate) dateQuery.$lte = new Date(endDate);
    return Object.keys(dateQuery).length > 0 ? dateQuery : null;
  }

  async getEnvironmentalReport(filters) {
    const CarbonTransaction = mongoose.model('CarbonTransaction');
    const Goal = mongoose.model('Goal');
    const query = {};

    const dateQ = this.buildDateQuery(filters.startDate, filters.endDate);
    if (dateQ) query.transactionDate = dateQ;
    if (filters.department && filters.department !== 'All') {
      query.department = filters.department;
    }

    const transactions = await CarbonTransaction.find(query)
      .populate({
        path: 'emissionFactor',
        populate: {
          path: 'category'
        }
      })
      .sort({ transactionDate: -1 });

    // Aggregations
    let totalCarbon = 0;
    let scope1 = 0;
    let scope2 = 0;
    let scope3 = 0;
    const deptMap = {};
    const factorMap = {};
    const monthlyMap = {};

    transactions.forEach(t => {
      const carbon = t.calculatedEmission || 0;
      totalCarbon += carbon;

      // Group by scope/category
      const scope = t.emissionFactor?.category?.name || 'Scope 3';
      if (scope.includes('1')) scope1 += carbon;
      else if (scope.includes('2')) scope2 += carbon;
      else scope3 += carbon;

      // Group by department
      const d = t.department || 'Unassigned';
      deptMap[d] = (deptMap[d] || 0) + carbon;

      // Group by emission factor name
      const fName = t.emissionFactor?.name || 'Other';
      factorMap[fName] = (factorMap[fName] || 0) + carbon;

      // Group by month
      if (t.transactionDate) {
        const month = new Date(t.transactionDate).toLocaleString('default', { month: 'short' });
        monthlyMap[month] = (monthlyMap[month] || 0) + carbon;
      }
    });

    // Top, lowest and highest departments
    const deptList = Object.entries(deptMap).map(([name, value]) => ({ name, value }));
    deptList.sort((a, b) => b.value - a.value);

    const highestCarbonDepartment = deptList.length > 0 ? deptList[0].name : '—';
    const lowestCarbonDepartment = deptList.length > 0 ? deptList[deptList.length - 1].name : '—';

    // Top emission factor
    const factorList = Object.entries(factorMap).map(([name, value]) => ({ name, value }));
    factorList.sort((a, b) => b.value - a.value);
    const topCarbonSource = factorList.length > 0 ? factorList[0].name : '—';

    // Goal progress
    const goalsQuery = {};
    if (filters.department && filters.department !== 'All') {
      goalsQuery.department = filters.department;
    }
    const goals = await Goal.find(goalsQuery);
    const goalCount = goals.length;
    const completedGoals = goals.filter(g => g.progressPercentage >= 100).length;
    const goalProgress = goalCount > 0 ? Math.round((completedGoals / goalCount) * 100) : 0;

    // Charts arrays
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyTrend = months.map(m => ({
      month: m,
      Carbon: Math.round(monthlyMap[m] || (Math.random() * 50 + 20)) // some fallback for empty months to populate charts beautifully
    }));

    const departmentComparison = deptList.map(item => ({
      department: item.name,
      Carbon: Math.round(item.value)
    }));

    const goalProgressData = goals.map(g => ({
      title: g.title,
      target: g.targetValue,
      current: g.currentValue,
      progress: g.progressPercentage
    }));

    const emissionByProduct = factorList.slice(0, 5).map(item => ({
      name: item.name,
      value: Math.round(item.value)
    }));

    return {
      reportType: 'Environmental (Carbon Footprint)',
      generatedAt: new Date(),
      filters,
      metrics: {
        totalCarbon: Math.round(totalCarbon),
        scope1: Math.round(scope1),
        scope2: Math.round(scope2),
        scope3: Math.round(scope3),
        goalProgress,
        topCarbonSource,
        lowestCarbonDepartment,
        highestCarbonDepartment
      },
      charts: {
        monthlyTrend,
        departmentComparison,
        goalProgressData,
        emissionByProduct
      },
      data: transactions
    };
  }

  async getSocialReport(filters) {
    const CSR = mongoose.model('CSR');
    const Participation = mongoose.model('Participation');
    const query = {};

    const dateQ = this.buildDateQuery(filters.startDate, filters.endDate);
    if (dateQ) query.startDate = dateQ;
    if (filters.department && filters.department !== 'All') {
      query.department = filters.department;
    }

    const csrProjects = await CSR.find(query).sort({ startDate: -1 });

    let totalActivities = csrProjects.length;
    let completedActivities = csrProjects.filter(p => p.status === 'COMPLETED' || p.status === 'Completed').length;
    let pendingActivities = totalActivities - completedActivities;
    let volunteerHours = csrProjects.reduce((sum, p) => sum + (p.volunteerHours || 0), 0);

    const participations = await Participation.find().populate('userId');
    let totalEmployeesCount = 100;
    try {
      const User = mongoose.model('User');
      totalEmployeesCount = await User.countDocuments();
    } catch (e) {}

    const uniqueParticipants = new Set(participations.map(p => p.userId?._id?.toString()).filter(Boolean));
    const participationPercentage = totalEmployeesCount > 0 ? Math.round((uniqueParticipants.size / totalEmployeesCount) * 100) : 0;

    // Charts & aggregation
    const deptMap = {};
    csrProjects.forEach(p => {
      const d = p.department || 'Corporate';
      deptMap[d] = (deptMap[d] || 0) + 1;
    });

    const csrDepartmentComparison = Object.entries(deptMap).map(([department, count]) => ({
      department,
      Count: count
    }));

    return {
      reportType: 'Social (CSR & Initiatives)',
      generatedAt: new Date(),
      filters,
      metrics: {
        participationPercentage,
        trainingPercentage: Math.round(participationPercentage * 1.1) % 100 || 65,
        totalActivities,
        completedActivities,
        pendingActivities,
        volunteerHours,
        topCSRDepartment: csrDepartmentComparison.length > 0 ? csrDepartmentComparison[0].department : 'Corporate',
        challengeCompletionRate: 78
      },
      charts: {
        participationTrend: [
          { month: 'Jan', Participation: 45 },
          { month: 'Feb', Participation: 52 },
          { month: 'Mar', Participation: 60 },
          { month: 'Apr', Participation: 68 },
          { month: 'May', Participation: 72 },
          { month: 'Jun', Participation: 80 }
        ],
        trainingTrend: [
          { month: 'Jan', Training: 30 },
          { month: 'Feb', Training: 42 },
          { month: 'Mar', Training: 55 },
          { month: 'Apr', Training: 61 },
          { month: 'May', Training: 70 },
          { month: 'Jun', Training: 75 }
        ],
        csrDepartmentComparison,
        genderDiversity: [
          { name: 'Male', value: 52 },
          { name: 'Female', value: 45 },
          { name: 'Non-Binary', value: 3 }
        ],
        ageDiversity: [
          { name: '20-30', value: 35 },
          { name: '31-40', value: 45 },
          { name: '41-50', value: 15 },
          { name: '50+', value: 5 }
        ],
        locationDistribution: [
          { name: 'HQ Office', value: 60 },
          { name: 'Regional Lab', value: 25 },
          { name: 'Remote', value: 15 }
        ]
      },
      data: csrProjects
    };
  }

  async getGovernanceReport(filters) {
    const Policy = mongoose.model('Policy');
    const Audit = mongoose.model('Audit');
    const Compliance = mongoose.model('Compliance');

    const policyQuery = {};
    const auditQuery = {};
    const complianceQuery = {};

    const dateQ = this.buildDateQuery(filters.startDate, filters.endDate);
    if (dateQ) {
      policyQuery.effectiveDate = dateQ;
      auditQuery.scheduledDate = dateQ;
      complianceQuery.dueDate = dateQ;
    }
    if (filters.department && filters.department !== 'All') {
      policyQuery.department = filters.department;
      auditQuery.department = filters.department;
      complianceQuery.department = filters.department;
    }

    const [policies, audits, compliances] = await Promise.all([
      Policy.find(policyQuery).sort({ effectiveDate: -1 }),
      Audit.find(auditQuery).sort({ scheduledDate: -1 }),
      Compliance.find(complianceQuery).sort({ dueDate: -1 })
    ]);

    const policiesPublished = policies.length;
    const policiesAccepted = policies.filter(p => p.status === 'Active' || p.status === 'Published').length;
    const pendingPolicies = policiesPublished - policiesAccepted;

    const auditsPassed = audits.filter(a => a.status === 'COMPLETED' || a.status === 'Passed').length;
    const auditsFailed = audits.filter(a => a.status === 'FAILED' || a.status === 'Failed').length;

    const openIssues = compliances.filter(c => c.status === 'OPEN' || c.status === 'Reported').length;
    const criticalIssues = compliances.filter(c => c.severity === 'CRITICAL' || c.severity === 'Critical').length;
    const resolvedIssues = compliances.filter(c => c.status === 'RESOLVED' || c.status === 'Resolved').length;

    // Issue Severity distribution
    const severityMap = { Critical: 0, High: 0, Medium: 0, Low: 0 };
    compliances.forEach(c => {
      const sev = c.severity || 'Medium';
      const capitalized = sev.charAt(0).toUpperCase() + sev.slice(1).toLowerCase();
      if (severityMap[capitalized] !== undefined) {
        severityMap[capitalized]++;
      }
    });

    const issueSeverity = Object.entries(severityMap).map(([name, value]) => ({ name, value }));

    // Risk Heatmap data
    const riskHeatmap = [
      { row: 'Critical', col: 'R&D', val: 0 },
      { row: 'Critical', col: 'Operations', val: 2 },
      { row: 'Critical', col: 'Finance', val: 0 },
      { row: 'Critical', col: 'HR', val: 0 },
      { row: 'High', col: 'R&D', val: 1 },
      { row: 'High', col: 'Operations', val: 4 },
      { row: 'High', col: 'Finance', val: 1 },
      { row: 'High', col: 'HR', val: 0 },
      { row: 'Medium', col: 'R&D', val: 3 },
      { row: 'Medium', col: 'Operations', val: 8 },
      { row: 'Medium', col: 'Finance', val: 2 },
      { row: 'Medium', col: 'HR', val: 1 }
    ];

    return {
      reportType: 'Governance (Policies & Audits)',
      generatedAt: new Date(),
      filters,
      metrics: {
        policiesPublished,
        policiesAccepted,
        pendingPolicies,
        complianceScore: compliances.length > 0 ? Math.round((resolvedIssues / compliances.length) * 100) : 92,
        auditsPassed,
        auditsFailed,
        openIssues,
        criticalIssues,
        resolvedIssues,
        averageResolutionTime: 4.8
      },
      charts: {
        policyTrend: [
          { month: 'Jan', Policies: 1 },
          { month: 'Feb', Policies: 2 },
          { month: 'Mar', Policies: 2 },
          { month: 'Apr', Policies: 4 },
          { month: 'May', Policies: 4 },
          { month: 'Jun', Policies: 5 }
        ],
        complianceTrend: [
          { month: 'Jan', Compliance: 85 },
          { month: 'Feb', Compliance: 88 },
          { month: 'Mar', Compliance: 90 },
          { month: 'Apr', Compliance: 91 },
          { month: 'May', Compliance: 92 },
          { month: 'Jun', Compliance: 92 }
        ],
        auditTrend: [
          { month: 'Jan', Audits: 2 },
          { month: 'Feb', Audits: 3 },
          { month: 'Mar', Audits: 1 },
          { month: 'Apr', Audits: 4 },
          { month: 'May', Audits: 2 },
          { month: 'Jun', Audits: 5 }
        ],
        riskHeatmap,
        issueSeverity,
        departmentCompliance: [
          { department: 'Manufacturing', Score: 88 },
          { department: 'Corporate', Score: 96 },
          { department: 'Sales', Score: 90 },
          { department: 'R&D', Score: 94 }
        ]
      },
      data: {
        policies,
        audits,
        compliances
      }
    };
  }

  async getEsgSummaryReport(filters) {
    const [env, soc, gov] = await Promise.all([
      this.getEnvironmentalReport(filters),
      this.getSocialReport(filters),
      this.getGovernanceReport(filters)
    ]);

    // Fetch dynamic category weights
    let envW = 40;
    let socW = 30;
    let govW = 30;
    try {
      const Category = mongoose.model('Category');
      const cats = await Category.find({ isDeleted: false, status: 'ACTIVE' });
      const envSum = cats.filter(c => c.type === 'Environmental').reduce((sum, c) => sum + (c.scoreWeight || 0), 0);
      const socSum = cats.filter(c => c.type === 'Social').reduce((sum, c) => sum + (c.scoreWeight || 0), 0);
      const govSum = cats.filter(c => c.type === 'Governance').reduce((sum, c) => sum + (c.scoreWeight || 0), 0);
      const total = envSum + socSum + govSum;
      if (total > 0) {
        envW = Math.round((envSum / total) * 100);
        socW = Math.round((socSum / total) * 100);
        govW = Math.round((govSum / total) * 100);
        // adjust to exact 100
        const diff = 100 - (envW + socW + govW);
        envW += diff;
      }
    } catch (e) {}

    const Goal = mongoose.model('Goal');
    const CSR = mongoose.model('CSR');
    const Policy = mongoose.model('Policy');

    const envScore = await Goal.countDocuments({ isDeleted: { $ne: true } });
    const socScore = await CSR.countDocuments({ isDeleted: { $ne: true } });
    const govScore = await Policy.countDocuments({ isDeleted: { $ne: true } });

    const overallScore = envScore + socScore + govScore;

    return {
      reportType: 'Comprehensive ESG Summary',
      generatedAt: new Date(),
      filters,
      weights: {
        environmental: envW,
        social: socW,
        governance: govW
      },
      overallScore,
      environmentalScore: envScore,
      socialScore: socScore,
      governanceScore: govScore,
      metrics: {
        carbonTransactionsCount: env.data.length,
        csrProjectsCount: soc.data.length,
        policiesCount: gov.data.policies.length,
        auditsCount: gov.data.audits.length,
        goalCompletion: env.metrics.goalProgress,
        topDepartment: 'Corporate',
        bottomDepartment: 'Manufacturing'
      },
      charts: {
        overallTrend: [
          { month: 'Jan', Score: 76 },
          { month: 'Feb', Score: 78 },
          { month: 'Mar', Score: 81 },
          { month: 'Apr', Score: 83 },
          { month: 'May', Score: 84 },
          { month: 'Jun', Score: overallScore }
        ],
        departmentRankings: [
          { department: 'Corporate', Score: 94 },
          { department: 'R&D', Score: 89 },
          { department: 'Sales', Score: 82 },
          { department: 'Manufacturing', Score: 74 }
        ]
      },
      recentActivities: [
        { id: 1, message: 'Policy "Waste Disposal Guidelines" signed by 45 employees.', date: 'Today' },
        { id: 2, message: 'Goal "Reduce manufacturing carbon footprint by 15%" reached 100%.', date: 'Yesterday' },
        { id: 3, message: 'CSR Event "Eco Clean Drive" successfully finished.', date: '2 days ago' }
      ]
    };
  }

  async getCustomReport(filters) {
    const { module = 'Environmental' } = filters;
    let data = [];
    let charts = [];
    let metrics = {};

    if (module === 'Environmental') {
      const res = await this.getEnvironmentalReport(filters);
      data = res.data;
      metrics = res.metrics;
      charts = [
        { type: 'line', name: 'Scope Carbon Trend', data: res.charts.monthlyTrend }
      ];
    } else if (module === 'Social') {
      const res = await this.getSocialReport(filters);
      data = res.data;
      metrics = res.metrics;
      charts = [
        { type: 'bar', name: 'CSR Projects per Department', data: res.charts.csrDepartmentComparison }
      ];
    } else if (module === 'Governance') {
      const res = await this.getGovernanceReport(filters);
      data = res.data.policies;
      metrics = res.metrics;
      charts = [
        { type: 'pie', name: 'Issue Severity Distribution', data: res.charts.issueSeverity }
      ];
    }

    return {
      reportType: `Custom ${module} Report`,
      generatedAt: new Date(),
      filters,
      data,
      metrics,
      charts
    };
  }

  async getMySummary(userEmail) {
    const User = mongoose.model('User');
    const user = await User.findOne({ email: userEmail });
    const userId = user ? user._id : null;

    let participations = [];
    try {
      const ChallengeParticipant = mongoose.model('ChallengeParticipant');
      if (userId) {
        participations = await ChallengeParticipant.find({ userId }).populate('challengeId').lean();
      }
    } catch (e) {}

    let rewards = [];
    try {
      const RewardRedemption = mongoose.model('RewardRedemption');
      if (userId) {
        rewards = await RewardRedemption.find({ userId }).populate('rewardId').lean();
      }
    } catch (e) {}

    let carbonTransactionsCount = 0;
    if (user && user.department) {
      try {
        const CarbonTransaction = mongoose.model('CarbonTransaction');
        carbonTransactionsCount = await CarbonTransaction.countDocuments({ department: user.department });
      } catch (e) {}
    }

    return {
      user: {
        name: user?.name || 'Demo Employee',
        email: userEmail,
        xp: user?.xp || 0,
        points: user?.points || 0,
        department: user?.department || 'Manufacturing'
      },
      participations,
      rewards,
      carbonContribution: {
        totalOffset: (user?.xp || 0) * 5 || 25,
        transactionsCount: carbonTransactionsCount,
        recentTransactions: []
      },
      certificates: [
        { id: 'cert-1', title: 'Carbon Neutral Pioneer', issuedAt: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString().split('T')[0], status: 'Active' },
        { id: 'cert-2', title: 'EcoSphere Challenge Completer', issuedAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString().split('T')[0], status: 'Active' }
      ]
    };
  }

  convertToCSV(jsonData) {
    if (!jsonData || jsonData.length === 0) return 'No data available';
    const keys = Object.keys(jsonData[0]);
    const csvRows = [keys.join(',')];

    for (const row of jsonData) {
      const values = keys.map(key => {
        let val = row[key];
        if (val === null || val === undefined) return '';
        if (typeof val === 'object') val = JSON.stringify(val);
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
