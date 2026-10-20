import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '@celestial/database';
import { authenticate, AuthRequest, signToken, isDemoModeActive } from '../../middleware/auth.js';

export const authRouter = Router();

// 系統認證與環境配置資訊（免登入即可讀取）
authRouter.get('/config', (_req: Request, res: Response) => {
  return res.json({
    success: true,
    data: {
      demoMode: isDemoModeActive(),
    },
  });
});

// 會員註冊
authRouter.post('/register', async (req, res: Response) => {
  try {
    const { email, password, displayName } = req.body;
    if (!email || !password || !displayName) {
      return res.status(400).json({ success: false, message: '請提供完整的信箱、密碼與暱稱' });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ success: false, message: '此電子信箱已被註冊' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        displayName,
        role: 'MEMBER',
      },
    });

    const token = signToken({ id: user.id, email: user.email, role: user.role });

    return res.status(201).json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          displayName: user.displayName,
          role: user.role,
        },
        token,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message || '註冊失敗' });
  }
});

// 會員登入
authRouter.post('/login', async (req, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: '請提供信箱與密碼' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ success: false, message: '帳號或密碼錯誤' });
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ success: false, message: '帳號或密碼錯誤' });
    }

    const token = signToken({ id: user.id, email: user.email, role: user.role });

    return res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          displayName: user.displayName,
          role: user.role,
        },
        token,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message || '登入失敗' });
  }
});

// 當前用戶資訊
authRouter.get('/me', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { id: true, email: true, displayName: true, role: true, avatarUrl: true, createdAt: true },
    });
    if (!user) {
      return res.status(404).json({ success: false, message: '使用者不存在' });
    }
    return res.json({ success: true, data: user });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message || '讀取失敗' });
  }
});
