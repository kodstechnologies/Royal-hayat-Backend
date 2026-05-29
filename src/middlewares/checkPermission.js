const checkPermission = (permission) => {

    return (req, res, next) => {
  
      // Super admin bypass
      if (req.user.role === 'admin') {
        return next();
      }
  
      // User inactive
      if (!req.user.isActive) {
        return res.status(403).json({
          success: false,
          message: 'Account disabled',
        });
      }
  
      // Permission check
      if (
        req.user.permissions.includes(permission)
      ) {
        return next();
      }
  
      return res.status(403).json({
        success: false,
        message: 'Permission denied',
      });
    };
  };
  
  export default checkPermission;