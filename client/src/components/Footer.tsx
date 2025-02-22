// components/Footer.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Footer.css';

const Footer: React.FC = () => {
  return (
    <footer className='landing-footer'>
      <div className='footer-content'>
        <div className='footer-section'>
          <h4>Documentation</h4>
          <Link to='/docs/getting-started'>Getting Started</Link>
          <Link to='/docs/guides'>Guides</Link>
          <Link to='/docs/api'>API Reference</Link>
        </div>
        <div className='footer-section'>
          <h4>Community</h4>
          <a
            href='https://github.com/oslabs-beta/cerberus'
            target='_blank'
            rel='noopener noreferrer'
          >
            GitHub
          </a>
          <a
            href='https://github.com/oslabs-beta/cerberus/issues'
            target='_blank'
            rel='noopener noreferrer'
          >
            Issues
          </a>
        </div>
        <div className='footer-section'>
          <h4>More</h4>
          <Link to='/privacy'>Privacy</Link>
          <Link to='/terms'>Terms</Link>
        </div>
      </div>
      <div className='footer-bottom'>
        <p>
          &copy; {new Date().getFullYear()} Cerberus Authentication Kit. All
          rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
