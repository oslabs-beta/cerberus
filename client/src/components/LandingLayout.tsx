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
  return (
    <div className='layout-wrapper'>
      <Navbar />
      <div className='landing-container'>
        {/* Left side - Landing content */}
        <div className='landing-content'>
          <h1 className='landing-title'>What is a passkey?</h1>

          {/* ... rest of your landing content ... */}
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
