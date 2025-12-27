export function isAdmin(req, res, next) {
  const role = req.user?.role || req.userRole || null;
  if (role !== 'admin') return res.status(403).json({ message: 'Forbidden: admin only' });
  next();
}

export default isAdmin;
