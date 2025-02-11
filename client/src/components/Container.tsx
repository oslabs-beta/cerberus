import React from 'react';
import '../styles/container.css';
import { useState } from 'react';
import SignUp from './Sign-up';
import Login from './Login';
import ForgotPW from './Forgot-PW';
import { useNavigate } from 'react-router-dom';

//container should accept and render the children from the app.tsx file
const Container = ({ children }: { children: React.ReactNode }) => {
  const [open, setOpen] = React.useState(false);
  const [isSignedUp, setIsSignedUp] = React.useState(false);
  const navigate = useNavigate();

  const handleOpen = () => {
    setOpen(!open);
  };

  return (
    <div className='dropdown'>
      <h1>Stop worrying and start coding</h1>
      <h2>
        Download the ultimate authentication package (currently only available
        for React + Vite + Node)
      </h2>
      <a href='https://github.com/oslabs-beta/cerberus' className='github-repo'>
        GitHub Repo
      </a>
      <h3>
        Try 3 different login types: Form-based, OAuth, and Passkey
        authentication
      </h3>
      <button onClick={handleOpen}>Choose your method of authentication</button>
      {open ? (
        <ul className='menu'>
          <li className='menu-item'>
            <button onClick={() => navigate('/Sign-up')}>Form-based</button>
          </li>
          <li className='menu-item'>
            <button>OAuth</button>
          </li>
          <li className='menu-item'>
            <button>Passkey</button>
          </li>
        </ul>
      ) : null}
      <div className='bottom-container'>
        {/* <SignUp></SignUp> */}
        {/* {isSignedUp ? (
          <Login />
        ) : (
          <SignUp onSignUpSuccess={() => setIsSignedUp(true)} />
        )} */}
        {/* <Login></Login> */}
        {/* <ForgotPW></ForgotPW> */}
      </div>
    </div>
  );
};

export default Container;
