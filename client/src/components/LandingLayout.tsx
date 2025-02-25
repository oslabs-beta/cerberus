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
            <section id='forms' className='content-section'>
              <h2 className='section-title'>Eliminate the Middleman</h2>
              <div className='subsection'>
                <h3 className='subsection-title'>
                  Cerberus was designed for developers who want to have full
                  control of their relationship with users.
                </h3>
                <p className='section-text'>
                  Users can register and sign-in via the traditional
                  password-based authentication, or the modern and secure
                  passkeys.
                </p>
                <p className='section-text'>
                  Try it out by entering your credentials on the form in this
                  page.
                </p>
                <p className='section-text'>
                  For session management, users authenticated via password are
                  managed with JWTs, while those authenticated with passkeys are
                  managed with Redis sessions.
                </p>
                <p className='section-text'>See more details below</p>
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
                <ul>
                  <li>
                    <a href='https://github.com/fsantin1985'>Fabiano Santin</a>
                  </li>
                  <li>
                    <a href='https://github.com/mjosephson5'>Molly Josephson</a>
                  </li>
                  <li>
                    <a href='https://github.com/duimaurisfootball'>
                      Gabriel Davis
                    </a>
                  </li>
                  <li><a href='https://github.com/BoyuHu514'>
                      Boyu Hu
                    </a>
                    </li>
                </ul>
              </div>

              <div id='sponsors' className='subsection'>
                <h3 className='subsection-title'>Sponsors</h3>
                <p className='section-text'>
                  <a href='https://www.opensourcelabs.io/'>OSLabs</a>
                </p>
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
