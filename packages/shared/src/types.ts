export type UserRole = 'ADMIN' | 'VIP' | 'MEMBER';

export type MasterStyle = 'classical' | 'psychological' | 'pragmatic';

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Array<{ path: string; message: string }>;
}

export interface HolographicReportRequest {
  profileId?: string;
  birthDate: string;
  gender: '男' | '女';
  longitude?: number;
  latitude?: number;
  name?: string;
  masterStyle?: MasterStyle;
}

export interface DailyRitualSummary {
  date: string;
  almanacSummary: string;
  favorableElement: string;
  dailyActionTitle: string;
  dailyActionDetail: string;
  guidanceCard: {
    source: 'buncho' | 'tarot';
    title: string;
    luckLevel: string;
    message: string;
  };
  streakDays: number;
}
