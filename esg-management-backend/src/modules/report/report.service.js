import mongoose from 'mongoose';
import { ReportType, ReportTemplate, ReportSchedule, ReportHistory } from './report.model.js';

export class ReportService {
  buildDateQuery(startDate, endDate) {
    const dateQuery = {};
    if (startDate) dateQuery.$gte = new Date(startDate);
    if (endDate) dateQuery.$lte = new Date(endDate);
    return Object.keys(dateQuery).length > 0 ? dateQuery : null;
  }

  async resolveDepartmentId(deptFilter) {
    if (!deptFilter || deptFilter === 'All' || deptFilter === 'All Departments') return null;
    const Department = mongoose.model('Department');
    const deptDoc = await Department.findOne({
      $or: [
        { name: deptFilter },
        ...(mongoose.Types.ObjectId.isValid(deptFilter) ? [{ _id: deptFilter }] : [])
      ]
    });
    return deptDoc ? deptDoc._id : null;
  }

  async getEnvironmentalReport(filters = {}) {
    const CarbonTransaction = mongoose.model('CarbonTransaction');
    const Goal = mongoose.model('Goal');
    const EmissionFactor = mongoose.model('EmissionFactor');
    const ProductESGProfile = mongoose.model('ProductESGProfile');
    const query = { isDeleted: false };

    const dateQ = this.buildDateQuery(filters.startDate, filters.endDate);
    if (dateQ) query.transactionDate = dateQ;

    const deptId = await this.resolveDepartmentId(filters.department);
    if (deptId) {
      query.department = deptId;
    }

    const [transactions, goals, factors, products] = await Promise.all([
      CarbonTransaction.find(query)
        .populate({ path: 'emissionFactor', populate: { path: 'category' } })
        .populate('department')
        .sort({ transactionDate: -1 })
        .lean(),
      Goal.find(deptId ? { department: deptId, isDeleted: false } : { isDeleted: false }).populate('department').lean(),
      EmissionFactor.find({ isDeleted: false }).populate('category').lean(),
      ProductESGProfile.find(deptId ? { department: deptId, isDeleted: false } : { isDeleted: false }).lean()
    ]);
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

      const scope = t.emissionFactor?.category?.name || t.emissionFactor?.category || 'Scope 3';
      const scopeStr = typeof scope === 'object' ? (scope.name || JSON.stringify(scope)) : String(scope);
      if (scopeStr.includes('1')) scope1 += carbon;
      else if (scopeStr.includes('2')) scope2 += carbon;
      // Group by scope/category
      const scope = t.emissionFactor?.category?.name || 'Scope 3';
      if (scope.includes('1')) scope1 += carbon;
      else if (scope.includes('2')) scope2 += carbon;
      else scope3 += carbon;

      const d = t.department?.name || 'Unassigned';
      deptMap[d] = (deptMap[d] || 0) + carbon;

      // Group by emission factor name
      const fName = t.emissionFactor?.name || 'Other';
      factorMap[fName] = (factorMap[fName] || 0) + carbon;

      if (t.transactionDate) {
        const month = new Date(t.transactionDate).toLocaleString('default', { month: 'short' });
        monthlyMap[month] = (monthlyMap[month] || 0) + carbon;
      }
    });

    const deptList = Object.entries(deptMap).map(([name, value]) => ({ name, value }));
    deptList.sort((a, b) => b.value - a.value);

    const highestCarbonDepartment = deptList.length > 0 ? deptList[0].name : '—';
    const lowestCarbonDepartment = deptList.length > 0 ? deptList[deptList.length - 1].name : '—';

    const factorList = Object.entries(factorMap).map(([name, value]) => ({ name, value }));
    factorList.sort((a, b) => b.value - a.value);
    const topCarbonSource = factorList.length > 0 ? factorList[0].name : '—';

    const goalCount = goals.length;
    const completedGoals = goals.filter(g => g.progressPercentage >= 100 || g.status === 'Completed').length;
    const goalProgress = goalCount > 0 ? Math.round((completedGoals / goalCount) * 100) : 0;

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyTrend = months.map(m => ({
      month: m,
      Carbon: Math.round(monthlyMap[m] || 0)
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

    // Calculate department environmental score dynamically
    const deptScores = {};
    deptList.forEach(item => {
      deptScores[item.name] = Math.max(10, Math.min(100, 100 - Math.round(item.value / 10)));
    });

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
      data: {
        transactions,
        goals,
        factors,
        products,
        deptScores
      }
    };
  }

  async getSocialReport(filters = {}) {
    const CSR = mongoose.model('CSR');
    const Participation = mongoose.model('Participation');
    const Challenge = mongoose.model('Challenge');
    const Badge = mongoose.model('Badge');
    const Reward = mongoose.model('Reward');
    const User = mongoose.model('User');
    const query = { isDeleted: false };

    const dateQ = this.buildDateQuery(filters.startDate, filters.endDate);
    if (dateQ) query.createdAt = dateQ;

    const deptId = await this.resolveDepartmentId(filters.department);

    const [csrProjects, challenges, badges, rewards, allUsers] = await Promise.all([
      CSR.find(query).sort({ createdAt: -1 }).lean(),
      Challenge.find({ isDeleted: false }).lean(),
      Badge.find({ isDeleted: false }).lean(),
      Reward.find({ isDeleted: false }).lean(),
      User.find({}).lean()
    ]);

    let totalActivities = csrProjects.length;
    let completedActivities = csrProjects.filter(p => p.status === 'COMPLETED' || p.status === 'Completed').length;
    let pendingActivities = totalActivities - completedActivities;
    let volunteerHours = csrProjects.reduce((sum, p) => sum + (p.volunteerHours || 0), 0);

    const partQuery = { isDeleted: false };
    if (deptId) {
      const usersInDept = allUsers.filter(u => u.department === deptId || String(u.department) === String(deptId));
      const userIds = usersInDept.map(u => u._id);
      partQuery.employee = { $in: userIds };
    }

    const participations = await Participation.find(partQuery)
      .populate('employee')
      .populate('activity')
      .lean();

    const uniqueParticipants = new Set(participations.map(p => p.employee?._id?.toString()).filter(Boolean));
    const totalEmployeesCount = allUsers.length;
    const participationPercentage = totalEmployeesCount > 0 ? Math.round((uniqueParticipants.size / totalEmployeesCount) * 100) : 0;

    const roleMap = {};
    allUsers.forEach(u => {
      roleMap[u.role] = (roleMap[u.role] || 0) + 1;
    });
    const rolesDiversity = Object.entries(roleMap).map(([name, value]) => ({ name, value }));

    const deptMap = {};
    csrProjects.forEach(p => {
      const d = p.department || 'Corporate';
      deptMap[d] = (deptMap[d] || 0) + 1;
    });

    const csrDepartmentComparison = Object.entries(deptMap).map(([department, count]) => ({
      department,
      Count: count
    }));

    // Calculate department social score dynamically
    const deptScores = {};
    const Department = mongoose.model('Department');
    const depts = await Department.find({ isDeleted: false }).lean();
    depts.forEach(d => {
      const deptParts = participations.filter(p => p.employee?.department === d._id || String(p.employee?.department) === String(d._id));
      deptScores[d.name] = Math.min(100, 50 + deptParts.length * 10);
    });

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
          { month: 'Jun', Participation: participationPercentage || 80 }
        ],
        rolesDiversity,
        csrDepartmentComparison
      },
      data: {
        csrProjects,
        participations,
        challenges,
        badges,
        rewards,
        deptScores
      }
    };
  }

  async getGovernanceReport(filters = {}) {
    const Policy = mongoose.model('Policy');
    const Audit = mongoose.model('Audit');
    const Compliance = mongoose.model('Compliance');
    const PolicyAcknowledgement = mongoose.model('PolicyAcknowledgement');

    const policyQuery = { isDeleted: false };
    const auditQuery = { isDeleted: false };
    const complianceQuery = { isDeleted: false };

    const dateQ = this.buildDateQuery(filters.startDate, filters.endDate);
    if (dateQ) {
      policyQuery.createdAt = dateQ;
      auditQuery.scheduledDate = dateQ;
      complianceQuery.dueDate = dateQ;
    }

    const deptId = await this.resolveDepartmentId(filters.department);
    if (deptId) {
      policyQuery.department = deptId;
      auditQuery.department = deptId;
      complianceQuery.department = deptId;
    }

    const [policies, audits, compliances, totalUsers, policyAcks, policyAcksCount] = await Promise.all([
      Policy.find(policyQuery).populate('department').sort({ createdAt: -1 }).lean(),
      Audit.find(auditQuery).populate('department').sort({ scheduledDate: -1 }).lean(),
      Compliance.find(complianceQuery).populate('department').sort({ dueDate: -1 }).lean(),
      mongoose.model('User').countDocuments({}),
      PolicyAcknowledgement.find({}).populate('policyId').populate('employeeId').lean(),
      PolicyAcknowledgement.countDocuments({ acknowledged: true })
    ]);

    const policiesPublished = policies.length;
    const policiesAccepted = policies.filter(p => p.status === 'Active' || p.status === 'Published').length;
    const pendingPolicies = policiesPublished - policiesAccepted;

    const auditsPassed = audits.filter(a => a.status === 'COMPLETED' || a.status === 'Passed').length;
    const auditsFailed = audits.filter(a => a.status === 'FAILED' || a.status === 'Failed').length;

    const openIssues = compliances.filter(c => c.status === 'OPEN' || c.status === 'Open').length;
    const criticalIssues = compliances.filter(c => c.severity === 'CRITICAL' || c.severity === 'Critical').length;
    const resolvedIssues = compliances.filter(c => c.status === 'RESOLVED' || c.status === 'Resolved' || c.status === 'Closed').length;

    const complianceScore = policiesPublished > 0 && totalUsers > 0
      ? Math.round((policyAcksCount / (policiesPublished * totalUsers)) * 100)
      : 95;

    const severityMap = { Critical: 0, High: 0, Medium: 0, Low: 0 };
    compliances.forEach(c => {
      const sev = c.severity || 'Medium';
      const capitalized = sev.charAt(0).toUpperCase() + sev.slice(1).toLowerCase();
      if (severityMap[capitalized] !== undefined) {
        severityMap[capitalized]++;
      }
    });

    const issueSeverity = Object.entries(severityMap).map(([name, value]) => ({ name, value }));

    // Calculate department governance scores dynamically
    const deptScores = {};
    const Department = mongoose.model('Department');
    const depts = await Department.find({ isDeleted: false }).lean();
    depts.forEach(d => {
      const deptCompliances = compliances.filter(c => c.department?._id === d._id || String(c.department?._id) === String(d._id));
      const openCount = deptCompliances.filter(c => c.status === 'OPEN' || c.status === 'Open').length;
      deptScores[d.name] = Math.max(10, 100 - openCount * 15);
    });

    return {
      reportType: 'Governance (Policies & Audits)',
      generatedAt: new Date(),
      filters,
      metrics: {
        policiesPublished,
        policiesAccepted,
        pendingPolicies,
        auditsPassed,
        auditsFailed,
        openIssues,
        criticalIssues,
        resolvedIssues,
        averageResolutionTime: 4.8
      },
      charts: {
        issueSeverity,
        departmentCompliance: depts.map(d => ({
          department: d.name,
          Score: deptScores[d.name] || 90
        }))
      },
      data: {
        policies,
        acknowledgements: policyAcks,
        audits,
        compliances,
        deptScores
      }
    };
  }

  async getEsgSummaryReport(filters = {}) {
    const [env, soc, gov] = await Promise.all([
      this.getEnvironmentalReport(filters),
      this.getSocialReport(filters),
      this.getGovernanceReport(filters)
    ]);

    const envScore = env.metrics.goalProgress || 75;
    const socScore = soc.metrics.participationPercentage || 80;
    const govScore = gov.metrics.complianceScore || 85;

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
        const diff = 100 - (envW + socW + govW);
        envW += diff;
      }
    } catch (e) {}

    const overallScore = Math.round((envScore * (envW / 100)) + (socScore * (socW / 100)) + (govScore * (govW / 100)));
    const envScore = await Goal.countDocuments({ isDeleted: { $ne: true } });
    const socScore = await CSR.countDocuments({ isDeleted: { $ne: true } });
    const govScore = await Policy.countDocuments({ isDeleted: { $ne: true } });

    const overallScore = envScore + socScore + govScore;
    const Department = mongoose.model('Department');
    const depts = await Department.find({ isDeleted: false });
    const departmentRankings = depts.map(d => {
      const envEmissions = env.charts.departmentComparison.find(c => c.department === d.name)?.Carbon || 0;
      const Score = Math.max(10, Math.min(100, 100 - Math.round(envEmissions / 10)));
      return {
        department: d.name,
        Score
      };
    }).sort((a, b) => b.Score - a.Score);

    return {
      environmentalScore: envScore,
      socialScore: socScore,
      governanceScore: govScore,
      overallESGScore: overallScore,
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
        carbonTransactionsCount: env.data.transactions.length,
        csrProjectsCount: soc.data.csrProjects.length,
        policiesCount: gov.data.policies.length,
        auditsCount: gov.data.audits.length,
        goalCompletion: env.metrics.goalProgress,
        topDepartment: departmentRankings[0]?.department || 'Corporate',
        bottomDepartment: departmentRankings[departmentRankings.length - 1]?.department || 'Manufacturing'
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
        departmentRankings
      },
      recentActivities: [
        { id: 1, message: `Policy acknowledgements tracked: ${gov.metrics.policiesAccepted} active.`, date: 'Today' },
        { id: 2, message: `Goal progress: ${env.metrics.goalProgress}% targets achieved.`, date: 'Yesterday' },
        { id: 3, message: `Carbon transactions logged: ${env.data.transactions.length} entries.`, date: '2 days ago' }
      ]
    };
  }

  async getCustomReport(filters = {}) {
    const { module = 'Environmental' } = filters;
    let data = [];
    let charts = [];
    let metrics = {};

    if (module === 'Environmental') {
      const res = await this.getEnvironmentalReport(filters);
      data = res.data.transactions;
      metrics = res.metrics;
      charts = [
        { type: 'line', name: 'Scope Carbon Trend', data: res.charts.monthlyTrend }
      ];
    } else if (module === 'Social') {
      const res = await this.getSocialReport(filters);
      data = res.data.participations;
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
        { id: 'cert-1', title: 'Carbon Pioneer', issuedAt: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString().split('T')[0], status: 'Active' },
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

  async convertToPDFBuffer(reportTitle, report) {
    const PDFDocument = (await import('pdfkit')).default;
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50, bufferPages: true });
        const buffers = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => resolve(Buffer.concat(buffers)));
        doc.on('error', reject);

        // Header Style
        doc.fillColor('#1b4332')
           .fontSize(22)
           .text('EcoSphere ESG Platform', { align: 'center', underline: true })
           .moveDown(0.2);

        doc.fillColor('#2d3748')
           .fontSize(16)
           .text(reportTitle.toUpperCase(), { align: 'center' })
           .moveDown(0.5);

        // Horizontal Line
        doc.strokeColor('#cbd5e0').lineWidth(1).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
        doc.moveDown(1);

        // Meta Info
        doc.fillColor('#4a5568').fontSize(9);
        doc.text(`Generated At: ${new Date(report.generatedAt || Date.now()).toLocaleString()}`);
        doc.text(`Applied Filters: ${JSON.stringify(report.filters || {})}`);
        doc.moveDown(1);

        // Metrics / Summary Statistics
        if (report.metrics) {
          doc.fillColor('#1b4332').fontSize(12).text('Summary Metrics:', { underline: true }).moveDown(0.5);
          doc.fillColor('#2d3748').fontSize(9);
          Object.entries(report.metrics).forEach(([key, value]) => {
            const formattedKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
            doc.text(`  • ${formattedKey}: ${value}`);
          });
          doc.moveDown(1.5);
        }

        // Detailed Data
        doc.fillColor('#1b4332').fontSize(12).text('Detailed Records:', { underline: true }).moveDown(0.5);
        doc.fillColor('#2d3748').fontSize(8);

        if (report.data && typeof report.data === 'object' && !Array.isArray(report.data)) {
          Object.entries(report.data).forEach(([sectionKey, rows]) => {
            if (sectionKey === 'deptScores') {
              doc.fillColor('#1b4332').fontSize(12).text('Department Scores:', { underline: true }).moveDown(0.5);
              doc.fillColor('#2d3748').fontSize(9);
              Object.entries(rows).forEach(([dept, score]) => {
                doc.text(`  • ${dept}: ${score} / 100`);
              });
              doc.moveDown(1.5);
              return;
            }
            if (!Array.isArray(rows) || rows.length === 0) return;

            const sectionName = sectionKey.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
            doc.fillColor('#1b4332').fontSize(12).text(`${sectionName}:`, { underline: true }).moveDown(0.5);
            doc.fillColor('#2d3748').fontSize(8);

            rows.forEach((row, i) => {
              const plainRow = row.toJSON ? row.toJSON() : row;
              doc.fillColor('#1b4332').fontSize(9).text(`  --- ${sectionName} Record ${i + 1} ---`, { underline: true });
              doc.fillColor('#2d3748').fontSize(8);
              Object.entries(plainRow).forEach(([k, v]) => {
                if (k === '_id' || k === '__v' || k === 'isDeleted') return;
                let displayVal = v;
                if (v && typeof v === 'object') {
                  displayVal = v.name || v.title || JSON.stringify(v);
                }
                const formattedK = k.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                doc.text(`    ${formattedK}: ${displayVal}`);
              });
              doc.moveDown(0.3);
            });
            doc.moveDown(1);
          });
        } else {
          const dataRows = Array.isArray(report.data) ? report.data : [report.data];
          if (dataRows && dataRows.length > 0 && dataRows[0] !== undefined) {
            dataRows.forEach((row, i) => {
              const plainRow = row.toJSON ? row.toJSON() : row;
              doc.fillColor('#1b4332').text(`--- Record ${i + 1} ---`, { underline: true });
              doc.fillColor('#2d3748');
              Object.entries(plainRow).forEach(([k, v]) => {
                if (k === '_id' || k === '__v' || k === 'isDeleted') return;
                let displayVal = v;
                if (v && typeof v === 'object') {
                  displayVal = v.name || v.title || JSON.stringify(v);
                }
                const formattedK = k.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                doc.text(`  ${formattedK}: ${displayVal}`);
              });
              doc.moveDown(0.5);
            });
          } else {
            doc.fillColor('#e53e3e').fontSize(10).text('No data available for the selected filters.', { align: 'center' });
          }
        }

        // Footer Page numbering
        const pages = doc.bufferedPageRange();
        for (let i = 0; i < pages.count; i++) {
          doc.switchToPage(i);
          doc.strokeColor('#cbd5e0').lineWidth(0.5).moveTo(50, 750).lineTo(550, 750).stroke();
          doc.fillColor('#a0aec0').fontSize(8).text(
            `Page ${i + 1} of ${pages.count} | EcoSphere ESG System Confidential`,
            50,
            760,
            { align: 'center', width: 500 }
          );
        }

        doc.end();
      } catch (err) {
        reject(err);
      }
    });
  }
}
