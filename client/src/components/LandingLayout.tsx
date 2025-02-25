import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import '../styles/LandingLayout.css';
import { GitHub } from '@mui/icons-material';

// import 'highlight.js/styles/monokai.css';
import hljs from 'highlight.js/lib/core';
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
import bash from 'highlight.js/lib/languages/bash';
import json from 'highlight.js/lib/languages/json';

hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('bash', bash);
hljs.registerLanguage('json', json);

interface LandingLayoutProps {
  isAuthenticated: boolean;
  onLogout: () => void;
}

const LandingLayout: React.FC<LandingLayoutProps> = () => {
  useEffect(() => {
    // Initialize syntax highlighting on all code blocks
    document.querySelectorAll('pre code').forEach((block) => {
      hljs.highlightElement(block as HTMLElement);
    });
    // Set up intersection observer to highlight code blocks when they come into view
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const codeBlock = entry.target as HTMLElement;
            hljs.highlightElement(codeBlock);
          }
        });
      },
      { threshold: 0.1 }
    );

    // Observe all code blocks
    document.querySelectorAll('pre code').forEach((block) => {
      observer.observe(block);
    });

    // Clean up
    return () => {
      observer.disconnect();
    };
    // This will run whenever the location changes
  }, []);

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
                  <button className='header-button header-primary'>
                    Get Started
                  </button>
                  <a
                    href='https://github.com/oslabs-beta/cerberus'
                    target='_blank'
                    rel='noopener noreferrer'
                    className='header-button header-secondary'
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
                <div className='subsection'>
                  <h3 className='subsection-title'>Passkey Authentication</h3>
                  <p className='section-text'>
                    Passkeys represent the future of authentication—a
                    passwordless approach that's both more secure and more
                    user-friendly than traditional passwords. Cerberus
                    implements the WebAuthn standard (Web Authentication API) to
                    bring this technology to your application.
                  </p>
                  <h3 className='subsection-title'>Password Authentication</h3>
                  <p className='section-text'>
                    We understand that not all customers may be ready to use
                    passkey as this is still a nascent technology. For this
                    reason, we’ve built from the ground up a traditional email
                    and password authentication workflow that your clients may
                    opt into. Your users’ passwords are bcrypt-hashed and safely
                    stored in your database.
                  </p>
                </div>
                <div className='subsection'>
                  <h3 className='subsection-title'>Database</h3>
                  <p className='section-text'>
                    Cerberus uses PostgreSQL as its reliable, production-ready
                    database for storing user credentials. The database schema
                    includes dedicated tables for users, credentials, login
                    history, and password reset tokens—all optimized for
                    security and performance. PostgreSQL offers the perfect
                    balance of robustness and flexibility, supporting both
                    passkey public keys and securely hashed passwords. <br />{' '}
                    <br />
                    Our toolkit includes all necessary database migrations and
                    query utilities, allowing you to maintain complete control
                    over your user data without depending on third-party
                    authentication services. This ensures your application can
                    scale efficiently while maintaining the highest security
                    standards for sensitive authentication data.
                  </p>
                </div>
                <div className='subsection'>
                  <h3 className='subsection-title'>Session Management</h3>
                  <h4 className=''>Passkey</h4>

                  <p className='section-text'>
                    Cerberus implements a robust session management system using
                    Redis for passkey-authenticated users that differs from the
                    JWT approach used for password authentication.
                  </p>

                  <h4 className=''>Password</h4>

                  <p className='section-text'>
                    Cerberus uses a combination of two JWT tokens on cookies to
                    manage sessions for users authenticated with passwords.
                  </p>
                </div>
              </div>
            </section>

            {/* Getting Started Section */}
            <section id='getting-started' className='content-section'>
              <h2 className='section-title'>Getting Started</h2>

              <div className='subsection'>
                <h3 className='subsection-title'>Installation</h3>
                <p>
                  Get started with Cerberus by installing both the frontend and
                  backend packages:
                </p>
                <div className='code-block'>
                  <pre>
                    <code className='language-bash'>
                      # Install the backend package <br /> npm install
                      cerberus-auth-server <br /> <br /># Install the frontend
                      components <br />
                      npm install cerberus-auth-react
                    </code>
                  </pre>
                </div>
                <h3 className='subsection-title'>Configuration</h3>
                <p>
                  1. Set up your PostgreSQL database and update your environment
                  variables:
                </p>
                <div className='code-block'>
                  <pre>
                    <code className='language-bash'>
                      DB_HOST=localhost
                      <br />
                      DB_PORT=5432
                      <br />
                      DB_USER=your_username
                      <br />
                      DB_PASSWORD=your_password
                      <br />
                      DB_NAME=auth_db
                      <br />
                      SESSION_SECRET=your_session_secret
                      <br />
                      JWT_SECRET=your_jwt_secret
                    </code>
                  </pre>
                </div>
                <p>2. Configure your Express application:</p>
                <div className='code-block'>
                  <pre>
                    <code className='language-javascript'>
                      {`import express from 'express';
import { setupCerberus } from 'cerberus-auth-server';

const app = express();

// Initialize Cerberus with your configuration
await setupCerberus(app, {
  redisUrl: 'redis://localhost:6379',
  sessionSecret: process.env.SESSION_SECRET!,
  jwtSecret: process.env.JWT_SECRET!,
  rpName: 'Your App Name',
  rpID: 'yourdomain.com'
});

app.listen(3000, () => {
  console.log('Server running with Cerberus authentication');
});`}
                    </code>
                  </pre>
                </div>
                <p>3. Add Cerberus components to your React application:</p>
                <div className='code-block'>
                  <pre>
                    <code className='language-javascript'>
                      {`import { AuthProvider, LoginForm, SignupForm, CreatePasskey } from 'cerberus-auth-react';

const App = () => {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginForm />} />
        <Route path="/signup" element={<SignupForm />} />
        <Route path="/passkey" element={<CreatePasskey />} />
        {/* Your protected routes */}
      </Routes>
    </AuthProvider>
  );
};`}
                    </code>
                  </pre>
                </div>
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
                  <li>
                    <a href='https://github.com/BoyuHu514'>Boyu Hu</a>
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
