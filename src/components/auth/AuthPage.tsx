import { useState } from 'react';
import SignInForm from './SignInForm';
import SignUpForm from './SignUpForm';
import { useAuth } from '../../services/auth/AuthContext';

const AuthPage = () => {
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  const { isLoading } = useAuth();

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gray-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <img 
          className="mx-auto h-16 w-auto" 
          src="/logo.svg" 
          alt="Invoice Generator" 
        />
        <h1 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Invoice Generator
        </h1>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {/* Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <div className="flex justify-center -mb-px">
              <button
                onClick={() => setActiveTab('signin')}
                className={`py-2 px-4 border-b-2 font-medium text-sm ${
                  activeTab === 'signin'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } transition-colors duration-200`}
                disabled={isLoading}
              >
                Sign In
              </button>
              <button
                onClick={() => setActiveTab('signup')}
                className={`ml-8 py-2 px-4 border-b-2 font-medium text-sm ${
                  activeTab === 'signup'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } transition-colors duration-200`}
                disabled={isLoading}
              >
                Sign Up
              </button>
            </div>
          </div>

          {/* Form */}
          {activeTab === 'signin' ? <SignInForm /> : <SignUpForm />}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
