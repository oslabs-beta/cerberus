import React from 'react';
import '../styles/container.css';
import { useState } from 'react';
import SignUp from './Sign-up';
import Login from './Login';
import ForgotPW from './Forgot-PW';
import Passkey from './CreatePasskey';
import { useNavigate } from 'react-router-dom';
import Dashboard from './Dashboard';
import OAuthButtons from './Oauth';
import CreatePasskey from './CreatePasskey';
// import Passkey from './Passkey';

//container should accept and render the children from the app.tsx file
const Container = ({ children }: { children: React.ReactNode }) => {
  const [open, setOpen] = React.useState(false);
  const [isSignedUp, setIsSignedUp] = React.useState(false);
  const navigate = useNavigate();
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);

  const handleOpen = () => {
    setOpen(!open);
  };

  const handleMethodSelect = (method: string) => {
    setSelectedMethod(method);
    setOpen(false);
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
            <button onClick={() => handleMethodSelect('oauth')}>OAuth</button>
          </li>
          <li className='menu-item'>
            <button onClick={() => handleMethodSelect('passkey')}>
              Passkey
            </button>
          </li>
        </ul>
      ) : null}
      <div className='bottom-container'>
        {/* {selectedMethod === 'form' && <SignUp />} */}
        {/* {isSignedUp ? (
          <Login />
        ) : (
          <SignUp onSignUpSuccess={() => setIsSignedUp(true)} />
        )} */}
        {selectedMethod === 'oauth' && <OAuthButtons />}
        {selectedMethod === 'passkey' && <CreatePasskey />}
        {/* <Passkey></Passkey> */}
        {/* <Dashboard></Dashboard> */}
      </div>
    </div>
  );
};

export default Container;
