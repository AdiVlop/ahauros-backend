// Admin authentication middleware
// Simple header-based authentication for Admin Dashboard

/**
 * Middleware to check if request is from Admin Dashboard
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export function isAdmin(req, res, next) {
  const dashboardRole = req.headers['x-dashboard-role'];
  
  if (dashboardRole === 'admin') {
    next();
  } else {
    res.status(403).json({ 
      error: 'Access denied. Admin role required.',
      message: 'This endpoint is only accessible from Admin Dashboard'
    });
  }
}

/**
 * Middleware to check if request is from User Dashboard
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export function isUser(req, res, next) {
  const dashboardRole = req.headers['x-dashboard-role'];
  
  if (dashboardRole === 'user' || !dashboardRole) {
    next();
  } else {
    res.status(403).json({ 
      error: 'Access denied. User role required.',
      message: 'This endpoint is only accessible from User Dashboard'
    });
  }
}

export default {
  isAdmin,
  isUser
};
