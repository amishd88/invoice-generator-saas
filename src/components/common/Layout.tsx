import React, { ReactNode } from 'react';
import UserProfile from '../auth/UserProfile';

interface LayoutProps {
  children: ReactNode;
  title?: string;
  rightContent?: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children, title = 'Invoice Generator', rightContent }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
          <h1 className="text-lg md:text-xl font-semibold text-gray-800 truncate">{title}</h1>
          <div className="flex items-center space-x-2">
            {rightContent}
            <UserProfile />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 py-4 md:py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center text-gray-500 text-sm">
          <div className="mb-2 md:mb-0">© {new Date().getFullYear()} Invoice Generator</div>
          <div className="flex space-x-4">
            <a href="#" className="hover:text-gray-700">Terms</a>
            <a href="#" className="hover:text-gray-700">Privacy</a>
            <a href="#" className="hover:text-gray-700">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
