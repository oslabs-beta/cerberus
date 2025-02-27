interface UserProfile {
  email: string;
  createdAt: string;
}

interface LoginHistoryItem {
  id: number;
  login_timestamp: string;
  ip_address: string;
  success: boolean;
}

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

export const userApiService = {
  async getProfile() {
    return fetch(`${API_BASE_URL}/api/user/profile`, {
      credentials: 'include',
    }).then((res) => {
      if (!res.ok) throw new Error('Failed to fetch profile');
      return res.json() as Promise<UserProfile>;
    });
  },

  async getLoginHistory() {
    return fetch(`${API_BASE_URL}/api/user/login-history`, {
      credentials: 'include',
    }).then((res) => {
      if (!res.ok) throw new Error('Failed to fetch login history');
      return res.json() as Promise<LoginHistoryItem[]>;
    });
  },

  async getUserActivity() {
    return fetch(`${API_BASE_URL}/api/user/activity`, {
      credentials: 'include',
    }).then((res) => {
      if (!res.ok) throw new Error('Failed to fetch activity');
      return res.json();
    });
  },
};
