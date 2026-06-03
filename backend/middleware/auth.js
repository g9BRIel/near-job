const jwt = require('jsonwebtoken');
const { Worker, Company } = require('../models');

const authMiddleware = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.header('Authorization');
    if (!authHeader) {
      return res.status(401).json({ 
        success: false,
        error: 'No token provided. Please login first.' 
      });
    }

    const token = authHeader.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        success: false,
        error: 'No token provided. Please login first.' 
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // Find user from either Worker or Company
    let user = await Worker.findByPk(decoded.id, {
      attributes: ['id', 'email', 'full_name', 'phone', 'userType', 'isActive']
    });
    
    let userType = 'worker';
    
    if (!user) {
      user = await Company.findByPk(decoded.id, {
        attributes: ['id', 'email', 'company_name', 'phone', 'userType', 'isActive']
      });
      userType = 'company';
    }
    
    if (!user) {
      return res.status(401).json({ 
        success: false,
        error: 'User not found. Invalid token.' 
      });
    }

    // Check if user is active
    if (user.isActive === false) {
      return res.status(401).json({ 
        success: false,
        error: 'Account is deactivated. Please contact support.' 
      });
    }

    // Attach user info to request
    req.user = {
      id: user.id,
      email: user.email,
      name: user.full_name || user.company_name,
      phone: user.phone,
      userType: userType,
      isActive: user.isActive
    };
    
    req.token = token;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false,
        error: 'Invalid token. Please login again.' 
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false,
        error: 'Token expired. Please login again.',
        code: 'TOKEN_EXPIRED'
      });
    }
    
    res.status(500).json({ 
      success: false,
      error: 'Authentication failed. Please try again.' 
    });
  }
};

module.exports = authMiddleware;