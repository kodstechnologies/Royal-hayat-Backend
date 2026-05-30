const checkPermission = (permission) => {
  const required = Array.isArray(permission) ? permission : [permission];

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

    const userPermissions = Array.isArray(req.user.permissions)
      ? req.user.permissions
      : [];

    // Permission check (any match when multiple are provided)
    if (required.some((key) => userPermissions.includes(key))) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: 'Permission denied',
    });
  };
};
  
  export default checkPermission;