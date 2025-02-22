import { useState } from 'react';
import { Search, Moon, Sun, Github } from 'lucide-react';
import '../styles/navbar.css';

export default function Navbar() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <nav className='navbar'>
      <div className='navbar-container'>
        {/* Left section - Brand */}
        <a href='/' className='brand'>
          Cerberus Authentication Kit
        </a>

        {/* Center section - Navigation and Search */}
        <div className='nav-links'>
          <a href='/getting-started' className='nav-item'>
            Getting Started
          </a>
          <a href='/guides' className='nav-item'>
            Guides
          </a>
        </div>

        <div className='search-container'>
          <input
            type='text'
            placeholder='Search'
            className='search-input'
            aria-label='Search documentation'
          />
          <Search className='search-icon' size={20} />
        </div>

        {/* Right section - GitHub and Dark Mode */}
        <div className='right-section'>
          <a
            href='https://github.com/oslabs-beta/cerberus'
            className='github-link'
            target='_blank'
            rel='noopener noreferrer'
            aria-label='View on GitHub'
          >
            <Github size={24} />
          </a>

          <button
            onClick={toggleDarkMode}
            className='theme-toggle'
            aria-label='Toggle dark mode'
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </div>
    </nav>
  );
}
