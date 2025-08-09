const passport = require('passport');

const requireAuth = passport.authenticate('jwt', { session: false });

const requireAdmin = (req, res, next) => {
  if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'superadmin')) {
    return res.status(403).json({ success: false, message: 'Acceso denegado' });
  }
  next();
};

module.exports = { requireAuth, requireAdmin };





