import React from 'react';
import '../styles/container.css';
import { useNavigate } from 'react-router-dom';

//defines a TypeScript interface named DashboardProps with onLogout prop
interface DashboardProps {
  onLogout?: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onLogout }) => {
  const navigate = useNavigate();

  //if logout navigate back to landing page
  const handleLogout = () => {
    // Call the onLogout function if provided
    if (onLogout) {
      onLogout();
    }

    // Clear token manually as backup
    localStorage.removeItem('authToken');

    // Navigate to landing page
    navigate('/');
  };

  return (
    <div>
      <h1>Successfully logged into account!</h1>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default Dashboard;
