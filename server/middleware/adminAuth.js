// 🛡️ Admin Authorization Middleware
// Checks if the authenticated user is an admin before allowing access

const adminAuthMiddleware = (req, res, next) => {
  // Ensure authMiddleware has already run and attached user to req
  if (!req.user) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  // Check if user is admin
  if (!req.user.isAdmin) {
    return res.status(403).json({ message: 'Admin privileges required' });
  }

  next();
};

module.exports = adminAuthMiddleware;
