import React from 'react';
import { LogOut } from 'lucide-react';
import '../styles/Dashboard.css';
import { useDashboardData } from '../hooks/useDashboardData';
import type { LoginHistoryItem } from '../types';

interface DashboardProps {
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onLogout }) => {
  const { dashboardData, error, isLoading } = useDashboardData();

  if (isLoading) {
    return <div className='dashboard-container'>Loading...</div>;
  }

  if (error) {
    return <div className='dashboard-container'>Error: {error.message}</div>;
  }

  if (!dashboardData) {
    return <div className='dashboard-container'>No data available</div>;
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
            <div className='info-value'>{dashboardData.email}</div>
          </div>
          <div className='info-group'>
            <div className='info-label'>Account Created</div>
            <div className='info-value'>
              {new Date(dashboardData.createdAt).toLocaleDateString()}
            </div>
          </div>
        </div>

        {/* Statistics Card */}
        <div className='dashboard-card'>
          <h2 className='card-title'>Account Statistics</h2>
          <div className='stats-grid'>
            <div className='stat-card'>
              <div className='stat-value'>{dashboardData.loginCount || 0}</div>
              <div className='stat-label'>Total Logins</div>
            </div>
            <div className='stat-card'>
              <div className='stat-value'>1</div>
              <div className='stat-label'>Active Sessions</div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity Card */}
      <div className='dashboard-card'>
        <h2 className='card-title'>Recent Activity</h2>
        <div className='activity-list'>
          {dashboardData.loginHistory?.map((activity: LoginHistoryItem) => (
            <div key={activity.id} className='activity-item'>
              <div className='activity-title'>
                Login from {activity.ip_address}
              </div>
              <div className='activity-time'>
                {new Date(activity.login_timestamp).toLocaleString()}
              </div>
            </div>
          ))}
          {(!dashboardData.loginHistory ||
            dashboardData.loginHistory.length === 0) && (
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
