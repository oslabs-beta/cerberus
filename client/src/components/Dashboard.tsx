import React, { useState, useEffect } from 'react';
import { LogOut } from 'lucide-react';
import '../styles/Dashboard.css';

interface UserData {
  email: string;
  lastLogin: string;
  loginCount: number;
  accountCreated: string;
}

interface ActivityLog {
  id: number;
  action: string;
  timestamp: string;
}

interface DashboardProps {
  user: {
    id: string;
    email: string;
  } | null;
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onLogout }) => {
  const [userData, setUserData] = useState<UserData>({
    email: '',
    lastLogin: '',
    loginCount: 0,
    accountCreated: '',
  });

  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch user data
        const userResponse = await fetch('/api/user/profile', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('authToken')}`,
          },
        });

        if (userResponse.ok) {
          const userData = await userResponse.json();
          setUserData(userData);
        }

        // Fetch activity logs
        const activityResponse = await fetch('/api/user/activity', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('authToken')}`,
          },
        });

        if (activityResponse.ok) {
          const activityData = await activityResponse.json();
          setActivities(activityData);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return <div className='dashboard-container'>Loading...</div>;
  }

  return (
    <div className='dashboard-container'>
      <header className='dashboard-header'>
        <h1 className='dashboard-title'>Welcome to Your Dashboard</h1>
        <button className='logout-button' onClick={onLogout}>
          <LogOut size={18} />
          Logout
        </button>
      </header>

      <div className='dashboard-grid'>
        {/* Profile Information Card */}
        <div className='dashboard-card'>
          <h2 className='card-title'>Profile Information</h2>
          <div className='info-group'>
            <div className='info-label'>Email</div>
            <div className='info-value'>{userData.email}</div>
          </div>
          <div className='info-group'>
            <div className='info-label'>Account Created</div>
            <div className='info-value'>{userData.accountCreated}</div>
          </div>
          <div className='info-group'>
            <div className='info-label'>Last Login</div>
            <div className='info-value'>{userData.lastLogin}</div>
          </div>
        </div>

        {/* Statistics Card */}
        <div className='dashboard-card'>
          <h2 className='card-title'>Account Statistics</h2>
          <div className='stats-grid'>
            <div className='stat-card'>
              <div className='stat-value'>{userData.loginCount}</div>
              <div className='stat-label'>Total Logins</div>
            </div>
            <div className='stat-card'>
              <div className='stat-value'>2</div>
              <div className='stat-label'>Active Sessions</div>
            </div>
            <div className='stat-card'>
              <div className='stat-value'>1</div>
              <div className='stat-label'>Registered Devices</div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity Card */}
      <div className='dashboard-card'>
        <h2 className='card-title'>Recent Activity</h2>
        <div className='activity-list'>
          {activities.map((activity) => (
            <div key={activity.id} className='activity-item'>
              <div className='activity-title'>{activity.action}</div>
              <div className='activity-time'>{activity.timestamp}</div>
            </div>
          ))}
          {activities.length === 0 && (
            <div className='activity-item'>
              <div className='activity-title'>No recent activity</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
