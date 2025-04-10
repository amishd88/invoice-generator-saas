import React from 'react';

interface LoadingProps {
  size?: 'small' | 'medium' | 'large';
  fullScreen?: boolean;
  message?: string;
}

const Loading: React.FC<LoadingProps> = ({
  size = 'medium',
  fullScreen = false,
  message = 'Loading...',
}) => {
  // Determine spinner size
  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'h-5 w-5';
      case 'large':
        return 'h-12 w-12';
      case 'medium':
      default:
        return 'h-8 w-8';
    }
  };

  // Determine text size
  const getTextClasses = () => {
    switch (size) {
      case 'small':
        return 'text-sm';
      case 'large':
        return 'text-lg';
      case 'medium':
      default:
        return 'text-base';
    }
  };

  const spinnerElement = (
    <svg
      className={`animate-spin text-primary-600 ${getSizeClasses()}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
  );

  // If fullScreen, show a centered loading indicator that fills the viewport
  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-gray-100 bg-opacity-75 flex flex-col items-center justify-center z-50">
        {spinnerElement}
        {message && <p className={`mt-4 text-text-secondary font-inter ${getTextClasses()}`}>{message}</p>}
      </div>
    );
  }

  // Otherwise, return an inline loading indicator
  return (
    <div className="flex flex-col items-center justify-center py-4">
      {spinnerElement}
      {message && <p className={`mt-2 text-text-secondary font-inter ${getTextClasses()}`}>{message}</p>}
    </div>
  );
};

export default Loading;
