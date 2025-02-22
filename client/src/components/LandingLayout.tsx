// components/LandingLayout.tsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import '../styles/LandingLayout.css';

interface LandingLayoutProps {
  isAuthenticated: boolean;
  onLogout: () => void;
}

const LandingLayout: React.FC<LandingLayoutProps> = () => {
  const url = 'https://github.com/oslabs-beta/cerberus';
  const handleClick = () => {
    window.open(url, '_blank'); // Opens in new tab
    // or window.location.href = url; // Opens in same tab
  };

  return (
    <div className='layout-wrapper'>
      <Navbar />
      <div className='landing-container'>
        {/* Left side - Landing content */}
        <div className='landing-content'>
          <h1 className='landing-title'>Authenticate Your App</h1>
          <h2>Free. Open Source. Forever.</h2>
          <button>Get Started</button>
          <button onClick={handleClick}>Source</button>

          {/* ... rest of landing content ... */}
        </div>

        {/* Right side - Auth forms */}
        <div className='auth-container'>
          <div className='auth-content'>
            <Outlet />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default LandingLayout;
