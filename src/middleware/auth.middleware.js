import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'change-me';

export function verifyJWT(req, res, next) {
  const auth = req.headers.authorization || req.headers.Authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const token = auth.split(' ')[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    // attach minimal user info for downstream handlers
    req.user = { id: payload.id, role: payload.role };
    return next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

export default verifyJWT;
