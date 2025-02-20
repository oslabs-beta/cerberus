// import React from 'react';
// import '../styles/container.css';
// import { useState } from 'react';
// // import SignUp from './Sign-up';
// // import Login from './Login';
// // import ForgotPW from './Forgot-PW';
// // import Passkey from './Passkey';
// import { useNavigate } from 'react-router-dom';

// //container should accept and render the children from the app.tsx file
// const Dashboard = () => {
//   const navigate = useNavigate();

//   const goToLandingPage = () => {
//     navigate('/');
//   };

//   return (
//     <div>
//       <h1>Successfully logged into account!</h1>
//       <button onClick={goToLandingPage}>Logout</button>
//     </div>
//   );
// };
// export default Dashboard;

import React from 'react';
import '../styles/container.css';
import { useNavigate } from 'react-router-dom';

interface DashboardProps {
  onLogout?: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onLogout }) => {
  const navigate = useNavigate();

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
