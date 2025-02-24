// src/types/index.ts
export interface UserProfile {
  email: string;
  createdAt: string;
  loginCount: number;
}

export interface LoginHistoryItem {
  id: number;
  login_timestamp: string;
  ip_address: string;
  success: boolean;
}

export interface UserActivity {
  lastLogin: Date;
  loginCount: number;
}

export interface DashboardData {
  email: string;
  createdAt: string;
  loginCount: number;
  loginHistory: LoginHistoryItem[];
}
