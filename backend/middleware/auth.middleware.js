const { supabase } = require('../config/supabase');

/**
 * Verify JWT token from request headers
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'Unauthorized',
        message: 'No token provided' 
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ 
        error: 'Unauthorized',
        message: 'Invalid or expired token' 
      });
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({ 
      error: 'Internal Server Error',
      message: 'Authentication failed' 
    });
  }
};

/**
 * Check if user has specific role
 */
const authorize = (...roles) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ 
          error: 'Unauthorized',
          message: 'User not authenticated' 
        });
      }

      // Get user profile with role
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', req.user.id)
        .single();

      if (error || !profile) {
        return res.status(403).json({ 
          error: 'Forbidden',
          message: 'User profile not found' 
        });
      }

      if (!roles.includes(profile.role)) {
        return res.status(403).json({ 
          error: 'Forbidden',
          message: `Access denied. Required role: ${roles.join(' or ')}` 
        });
      }

      req.userRole = profile.role;
      next();
    } catch (error) {
      console.error('Authorization error:', error);
      return res.status(500).json({ 
        error: 'Internal Server Error',
        message: 'Authorization failed' 
      });
    }
  };
};

module.exports = { authenticate, authorize };

