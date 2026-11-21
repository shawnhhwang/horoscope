import { Request, Response, NextFunction } from 'express';

interface ParsableSchema<T = unknown> {
  parse: (input: unknown) => T;
}

interface ValidationSchemas {
  body?: ParsableSchema<any>;
  query?: ParsableSchema<any>;
  params?: ParsableSchema<any>;
}

/**
 * [P0-SEC-02] 統一 Zod 請求參數驗證中介層
 * 非法生辰格式、超長字串或異常參數在進入 router 業務邏輯前直接回傳標準化 400 Bad Request
 */
export function validateRequest(schemas: ValidationSchemas) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (schemas.body) {
        req.body = schemas.body.parse(req.body);
      }
      if (schemas.query) {
        req.query = schemas.query.parse(req.query) as any;
      }
      if (schemas.params) {
        req.params = schemas.params.parse(req.params) as any;
      }
      return next();
    } catch (err: any) {
      if (Array.isArray(err?.issues)) {
        const errors = err.issues.map((issue: any) => ({
          path: Array.isArray(issue.path) ? issue.path.join('.') || 'body' : 'body',
          message: String(issue.message || '參數驗證失敗'),
        }));
        return res.status(400).json({
          success: false,
          message: errors[0]?.message || '請求參數格式驗證失敗',
          errors,
        });
      }
      return res.status(400).json({
        success: false,
        message: '請求參數格式錯誤',
      });
    }
  };
}
