import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-white border-t border-gray-200 py-6">
      <div className="container-custom">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-sm text-text-secondary">
              &copy; {currentYear} DataMinds.Services. All rights reserved.
            </p>
          </div>
          <div className="flex space-x-6">
            <Link to="/terms" className="text-sm text-text-secondary hover:text-primary-600 transition-colors duration-200">
              Terms of Service
            </Link>
            <Link to="/privacy" className="text-sm text-text-secondary hover:text-primary-600 transition-colors duration-200">
              Privacy Policy
            </Link>
            <a 
              href="mailto:support@dataminds.services" 
              className="text-sm text-text-secondary hover:text-primary-600 transition-colors duration-200"
            >
              Support
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
