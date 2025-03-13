// components/Footer.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Footer.css';
import { scrollToSection } from '../utils/scrollUtils';

const Footer: React.FC = () => {
  return (
    <footer className='landing-footer'>
      <div className='footer-content'>
        <div className='footer-section'>
          <h4>Documentation</h4>
          <a
            onClick={() => scrollToSection('about')}
            className='footer-item'
            style={{ cursor: 'pointer' }}
          >
            About
          </a>
          <a
            onClick={() => scrollToSection('getting-started')}
            className='footer-item'
            style={{ cursor: 'pointer' }}
          >
            Getting Started
          </a>
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
          <h4>Acknowledgements</h4>
          <a
            onClick={() => scrollToSection('contributors')}
            className='footer-item'
            style={{ cursor: 'pointer' }}
          >
            Contributors
          </a>
          <a
            onClick={() => scrollToSection('sponsors')}
            className='footer-item'
            style={{ cursor: 'pointer' }}
          >
            Sponsors
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
