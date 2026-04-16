const { httpError } = require("../utils/httpError");

function requireRole(roles) {
  const allowed = Array.isArray(roles) ? roles : [roles];
  return function requireRoleMiddleware(req, res, next) {
    const role = req.user?.role;
    if (!role) return next(httpError(401, "Unauthorized"));
    if (!allowed.includes(role)) return next(httpError(403, "Forbidden"));
    next();
  };
}

module.exports = { requireRole };

