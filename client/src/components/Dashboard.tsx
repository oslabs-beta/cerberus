import React from 'react';
import '../styles/container.css';
import { useState } from 'react';
// import SignUp from './Sign-up';
// import Login from './Login';
// import ForgotPW from './Forgot-PW';
// import Passkey from './Passkey';
import { useNavigate } from 'react-router-dom';

//container should accept and render the children from the app.tsx file
const Dashboard = () => {
  const navigate = useNavigate();

  const goToLandingPage = () => {
    navigate('/');
  };

  return (
    <div>
      <h1>Successfully logged into account!</h1>
      <button onClick={goToLandingPage}>Logout</button>
    </div>
  );
};
// //h1 congratulations
// //change export default daashboard
// //logout button
// //go to dashboard after successfully logging in
// //logout button link back to main container (main page '/')
// //fix link on component **
export default Dashboard;
