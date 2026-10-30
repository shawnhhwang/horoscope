import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '@celestial/database';

export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      console.error('🚨 [SECURITY WARNING]: JWT_SECRET is not set in production! A fallback key is dangerous.');
    }
    return 'celestial_jwt_secret_dev_key_2026';
  }
  return secret;
}

const JWT_SECRET = getJwtSecret();

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: string;
}

export interface AuthRequest extends Request {
  user?: AuthenticatedUser;
}

let cachedDemoVisitorUser: AuthenticatedUser | null = null;

export async function getDemoVisitorUser(): Promise<AuthenticatedUser> {
  if (cachedDemoVisitorUser) return cachedDemoVisitorUser;
  try {
    let visitor = await prisma.user.findFirst({
      where: { email: 'demo-visitor@celestial.dao' },
    });
    if (!visitor) {
      visitor = await prisma.user.upsert({
        where: { email: 'demo-visitor@celestial.dao' },
        update: {},
        create: {
          email: 'demo-visitor@celestial.dao',
          passwordHash: '$2a$10$DemoVisitorDisabledPasswordHashPlaceholder',
          displayName: '訪客體驗帳號',
          role: 'MEMBER',
          emailVerified: false,
        },
      });
    }
    cachedDemoVisitorUser = {
      id: visitor.id,
      email: visitor.email,
      role: visitor.role,
    };
    return cachedDemoVisitorUser;
  } catch (err) {
    return { id: 'demo-visitor-id', email: 'demo-visitor@celestial.dao', role: 'MEMBER' };
  }
}

/**
 * 檢查系統當前是否處於 DEMO 體驗模式 (嚴格 Fail-Closed 設計)
 * 預設關閉；生產環境下強制關閉 (除非環境變數特別指定 ALLOW_PROD_DEMO=true)
 */
export function isDemoModeActive(): boolean {
  if (process.env.NODE_ENV === 'production' && process.env.ALLOW_PROD_DEMO !== 'true') {
    return false;
  }
  return process.env.DEMO_MODE === 'true';
}

export function signToken(user: { id: string; email: string; role: string }): string {
  return jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, {
    expiresIn: '24h',
  });
}

export function verifyToken(token: string): AuthenticatedUser | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthenticatedUser;
  } catch {
    return null;
  }
}

export async function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const demoActive = isDemoModeActive();
  const isDemoHeader = req.headers['x-demo-mode'] === 'true' && demoActive;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    if (isDemoHeader) {
      req.user = await getDemoVisitorUser();
      return next();
    }
    if (req.headers['x-demo-mode'] === 'true' && !demoActive) {
      return res.status(401).json({ success: false, message: '系統已關閉 DEMO 體驗模式，請登入真實帳號' });
    }
    return res.status(401).json({ success: false, message: '未提供授權憑證，請先登入' });
  }

  const token = authHeader.split(' ')[1];
  if (isDemoHeader && (!token || token === 'undefined' || token === 'null')) {
    req.user = await getDemoVisitorUser();
    return next();
  }

  const decoded = verifyToken(token);
  if (decoded) {
    req.user = decoded;
    return next();
  }

  if (isDemoHeader) {
    req.user = await getDemoVisitorUser();
    return next();
  }
  return res.status(401).json({ success: false, message: '憑證無效或已過期，請重新登入' });
}

export function requireRole(allowedRoles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: '請先登入' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: '權限不足，拒絕訪問' });
    }
    next();
  };
}
