import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';

const secret = () => {
  const value = process.env.JWT_SECRET;
  if (!value) return null;
  return new TextEncoder().encode(value);
};

export async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

export async function signPharmacyToken(pharmacy) {
  const key = secret();
  if (!key) throw new Error('JWT_SECRET is not configured');
  return new SignJWT({ sub: pharmacy.id, role: 'pharmacy' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('8h')
    .sign(key);
}

export async function verifyPharmacyToken(token) {
  const key = secret();
  if (!key) return null;
  try {
    const { payload } = await jwtVerify(token, key);
    return payload.sub ? String(payload.sub) : null;
  } catch {
    return null;
  }
}

export function authMiddleware(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!token) return res.status(401).json({ error: 'Authentication required' });
  verifyPharmacyToken(token)
    .then(pharmacyId => {
      if (!pharmacyId) return res.status(401).json({ error: 'Invalid or expired token' });
      req.pharmacyId = pharmacyId;
      next();
    })
    .catch(next);
}
