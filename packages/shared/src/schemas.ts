import { z } from 'zod';

const safeDateString = z
  .string()
  .trim()
  .min(4, '日期格式過短')
  .max(64, '日期格式過長')
  .refine((val) => !Number.isNaN(new Date(val).getTime()), {
    message: '出生或目標日期格式無效',
  });

export const genderSchema = z.enum(['男', '女', '其他']).default('男');

export const loginSchema = z.object({
  email: z.string().trim().email('電子信箱格式無效').max(160),
  password: z.string().min(1, '請提供密碼').max(128),
});

export const registerSchema = z.object({
  email: z.string().trim().email('電子信箱格式無效').max(160),
  password: z.string().min(6, '密碼至少需 6 個字元').max(128),
  displayName: z.string().trim().min(1, '請提供使用者暱稱').max(64),
});

export const birthChartBaseSchema = z.object({
  birthDate: safeDateString,
  gender: genderSchema.optional().default('男'),
  longitude: z.coerce.number().min(-180).max(180).optional().default(120),
  latitude: z.coerce.number().min(-90).max(90).optional().default(25),
  targetDate: safeDateString.optional(),
  targetYear: z.coerce.number().int().min(1800).max(2200).optional(),
});

export const baziSynastrySchema = z.object({
  person1: z.object({
    name: z.string().trim().max(64).optional(),
    gender: genderSchema.optional().default('男'),
    birthDate: safeDateString,
    role: z.string().trim().max(32).optional(),
  }),
  person2: z.object({
    name: z.string().trim().max(64).optional(),
    gender: genderSchema.optional().default('女'),
    birthDate: safeDateString,
    role: z.string().trim().max(32).optional(),
  }),
});

export const createProfileSchema = z.object({
  name: z.string().trim().min(1, '請提供姓名').max(64),
  gender: genderSchema.optional().default('男'),
  birthDatetime: safeDateString,
  longitude: z.coerce.number().min(-180).max(180).optional().default(120),
  latitude: z.coerce.number().min(-90).max(90).optional().default(25),
  birthLocationName: z.string().trim().max(120).optional().nullable(),
  notes: z.string().max(1000).optional().nullable(),
});

export const llmMessageSchema = z.object({
  role: z.enum(['system', 'user', 'assistant']),
  content: z.string().min(1).max(8000),
});

export const llmChatSchema = z.object({
  messages: z.array(llmMessageSchema).min(1, '請提供有效的 messages 對話陣列').max(40),
  chartContext: z
    .object({
      moduleType: z.string().trim().min(1).max(64),
      title: z.string().max(200).optional(),
      summary: z.string().max(4000).optional(),
      rawData: z.any().optional(),
    })
    .optional(),
  stream: z.boolean().optional(),
});

export const simulatorStartSchema = z.object({
  birthDate: safeDateString,
  gender: z.enum(['男', '女']).optional().default('男'),
  profileName: z.string().trim().min(1).max(64).optional().default('求測者'),
  romanceFriends: z.array(z.any()).max(10).optional(),
  femaleFriends: z.array(z.any()).max(10).optional(),
  whatIfMode: z.boolean().optional(),
  branchDecisions: z.array(z.any()).max(20).optional(),
  partnerProfile: z
    .object({
      name: z.string().trim().max(64).optional(),
      gender: z.enum(['男', '女']).optional(),
      birthDate: safeDateString,
    })
    .optional(),
});
