// Reports service for Andreea AI orchestration
// Simple in-memory storage for training reports

let reports = [];

/**
 * Add a new training report
 * @param {string} agent - Agent name (ads, fraud, courier, etc.)
 * @param {string} text - Report text from Andreea
 * @param {string} status - Training status (started, completed, failed)
 */
export function addReport(agent, text, status = "started") {
  const report = {
    id: Date.now() + Math.random(),
    timestamp: new Date().toISOString(),
    agent,
    text,
    status
  };
  
  reports.unshift(report); // Add to beginning
  
  // Keep only last 50 reports
  if (reports.length > 50) {
    reports = reports.slice(0, 50);
  }
  
  return report;
}

/**
 * Get all reports (last 20 by default)
 * @param {number} limit - Number of reports to return
 * @returns {Array} Array of reports
 */
export function getReports(limit = 20) {
  return reports.slice(0, limit);
}

/**
 * Get reports for a specific agent
 * @param {string} agent - Agent name
 * @param {number} limit - Number of reports to return
 * @returns {Array} Array of reports for the agent
 */
export function getReportsByAgent(agent, limit = 10) {
  return reports
    .filter(report => report.agent === agent)
    .slice(0, limit);
}

/**
 * Get latest report for an agent
 * @param {string} agent - Agent name
 * @returns {Object|null} Latest report or null
 */
export function getLatestReport(agent) {
  const agentReports = reports.filter(report => report.agent === agent);
  return agentReports.length > 0 ? agentReports[0] : null;
}

/**
 * Clear all reports (for testing)
 */
export function clearReports() {
  reports = [];
}

export default {
  addReport,
  getReports,
  getReportsByAgent,
  getLatestReport,
  clearReports
};
