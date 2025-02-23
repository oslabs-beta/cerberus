import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import '../styles/LandingLayout.css';
import { GitHub } from '@mui/icons-material';

interface LandingLayoutProps {
  isAuthenticated: boolean;
  onLogout: () => void;
}

const LandingLayout: React.FC<LandingLayoutProps> = () => {
  return (
    <div className='layout-wrapper'>
      <Navbar />
      {/* Main content container */}
      <main className='landing-main'>
        {/* Scrollable left content */}
        <div className='landing-content'>
          <div className='content-wrapper'>
            {/* Hero Section */}
            <section className='hero-section'>
              <div className='hero-content'>
                <h1 className='hero-title'>Authenticate Your Users</h1>
                <h2 className='hero-subtitle'>Free. Open Source. Forever.</h2>
                <div className='hero-buttons'>
                  <button className='primary-button'>Get Started</button>
                  <a
                    href='https://github.com/oslabs-beta/cerberus'
                    target='_blank'
                    rel='noopener noreferrer'
                    className='secondary-button'
                  >
                    <GitHub className='button-icon' />
                    Source
                  </a>
                </div>
              </div>
            </section>

            {/* About Section */}
            <section id='about' className='content-section'>
              <h2 className='section-title'>About Cerberus</h2>
              <div className='section-content'>
                <p className='section-text'>
                  Cerberus is an open-source authentication toolkit that
                  simplifies implementing secure user authentication in your web
                  applications.
                </p>
                <p className='section-text'>
                  With support for both traditional password-based
                  authentication and modern passkeys, Cerberus provides a
                  flexible and secure solution for your authentication needs.
                </p>
              </div>
            </section>

            {/* Getting Started Section */}
            <section id='getting-started' className='content-section'>
              <h2 className='section-title'>Getting Started</h2>

              <div className='subsection'>
                <h3 className='subsection-title'>Installation</h3>
                <div className='code-block'>
                  <code>npm install cerberus-auth</code>
                </div>
              </div>

              <div className='subsection'>
                <h3 className='subsection-title'>Authentication</h3>
                <p className='section-text'>Coming soon...</p>
              </div>

              <div className='subsection'>
                <h3 className='subsection-title'>Database</h3>
                <p className='section-text'>Coming soon...</p>
              </div>

              <div className='subsection'>
                <h3 className='subsection-title'>Session Management</h3>
                <p className='section-text'>Coming soon...</p>
              </div>
            </section>

            {/* Acknowledgements Section */}
            <section id='acknowledgements' className='content-section'>
              <h2 className='section-title'>Acknowledgements</h2>

              <div id='contributors' className='subsection'>
                <h3 className='subsection-title'>Contributors</h3>
                <p className='section-text'>Coming soon...</p>
              </div>

              <div id='sponsors' className='subsection'>
                <h3 className='subsection-title'>Sponsors</h3>
                <p className='section-text'>Coming soon...</p>
              </div>
            </section>
          </div>
        </div>

        {/* Fixed right auth panel */}
        <div className='auth-panel'>
          <div className='auth-content'>
            <Outlet />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default LandingLayout;
