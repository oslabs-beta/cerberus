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

export const userApiService = {
  async getProfile() {
    return fetch('/api/user/profile', {
      credentials: 'include',
    }).then((res) => {
      if (!res.ok) throw new Error('Failed to fetch profile');
      return res.json() as Promise<UserProfile>;
    });
  },

  async getLoginHistory() {
    return fetch('/api/user/login-history', {
      credentials: 'include',
    }).then((res) => {
      if (!res.ok) throw new Error('Failed to fetch login history');
      return res.json() as Promise<LoginHistoryItem[]>;
    });
  },

  async getUserActivity() {
    return fetch('/api/user/activity', {
      credentials: 'include',
    }).then((res) => {
      if (!res.ok) throw new Error('Failed to fetch activity');
      return res.json();
    });
  },
};
