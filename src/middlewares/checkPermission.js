const checkPermission = (permission) => {
  const required = Array.isArray(permission) ? permission : [permission];

  return (req, res, next) => {
    if (req.user.role === 'admin') {
      return next();
    }

    if (!req.user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account disabled',
      });
    }

    const userPermissions = Array.isArray(req.user.permissions)
      ? req.user.permissions
      : [];

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