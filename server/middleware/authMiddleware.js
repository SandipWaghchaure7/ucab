const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        message: 'No token, authorization denied' 
      });
    }

    // Verify token
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();

  } catch (error) {
    return res.status(401).json({ 
      success: false, 
      message: 'Token is invalid or expired' 
    });
  }
};

// Role-based access
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: `Access denied. Required role: ${roles.join(', ')}` 
      });
    }
    next();
  };
};

module.exports = { protect, authorize };