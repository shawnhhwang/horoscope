import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '@celestial/database';

const JWT_SECRET = process.env.JWT_SECRET || 'celestial_jwt_secret_dev_key_2026';

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: string;
}

export interface AuthRequest extends Request {
  user?: AuthenticatedUser;
}

let cachedDemoAdminUser: AuthenticatedUser | null = null;

export async function getDemoAdminUser(): Promise<AuthenticatedUser> {
  if (cachedDemoAdminUser) return cachedDemoAdminUser;
  try {
    let admin = await prisma.user.findFirst({
      where: { role: 'ADMIN' },
    });
    if (!admin) {
      admin = await prisma.user.upsert({
        where: { email: 'admin@celestial.dao' },
        update: {},
        create: {
          email: 'admin@celestial.dao',
          passwordHash: '$2a$10$DemoAdminPasswordHashPlaceholder',
          displayName: '天機天衍管理員',
          role: 'ADMIN',
          emailVerified: true,
        },
      });
    }
    cachedDemoAdminUser = {
      id: admin.id,
      email: admin.email,
      role: admin.role,
    };
    return cachedDemoAdminUser;
  } catch (err) {
    return { id: 'demo-admin-id', email: 'admin@celestial.dao', role: 'ADMIN' };
  }
}

export function isDemoModeActive(): boolean {
  const envVal = process.env.DEMO_MODE;
  if (envVal === 'false' || envVal === '0') {
    return false;
  }
  return true;
}

export function signToken(user: { id: string; email: string; role: string }): string {
  return jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, {
    expiresIn: '7d',
  });
}

export async function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const demoActive = isDemoModeActive();
  const isDemoHeader = req.headers['x-demo-mode'] === 'true' && demoActive;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    if (isDemoHeader) {
      req.user = await getDemoAdminUser();
      return next();
    }
    if (req.headers['x-demo-mode'] === 'true' && !demoActive) {
      return res.status(401).json({ success: false, message: '系統已於環境變數關閉 DEMO 體驗模式，請登入真實帳號' });
    }
    return res.status(401).json({ success: false, message: '未提供授權憑證，請先登入' });
  }

  const token = authHeader.split(' ')[1];
  if (token === 'demo-admin-token' || (isDemoHeader && (!token || token === 'undefined' || token === 'null'))) {
    if (!demoActive) {
      return res.status(401).json({ success: false, message: '系統已於環境變數關閉 DEMO 體驗模式，請登入真實帳號' });
    }
    req.user = await getDemoAdminUser();
    return next();
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthenticatedUser;
    req.user = decoded;
    next();
  } catch (err) {
    if (isDemoHeader) {
      req.user = await getDemoAdminUser();
      return next();
    }
    return res.status(401).json({ success: false, message: '憑證無效或已過期，請重新登入' });
  }
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
