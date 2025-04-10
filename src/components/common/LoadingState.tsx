import React from 'react';

export interface LoadingStateProps {
  isLoading: boolean;
  children: React.ReactNode;
  loadingText?: string;
  size?: 'small' | 'medium' | 'large';
  fullScreen?: boolean;
  overlay?: boolean;
}

/**
 * LoadingState component
 * 
 * A versatile loading component that can be used in different contexts:
 * - As a full-screen loader
 * - As an overlay on top of content
 * - As an inline loader
 * 
 * @param isLoading Whether the loading state is active
 * @param children Content to render when not loading or to overlay
 * @param loadingText Optional text to display while loading
 * @param size Size of the spinner ('small', 'medium', 'large')
 * @param fullScreen Whether to display as a full-screen loader
 * @param overlay Whether to display as an overlay on top of children
 */
const LoadingState: React.FC<LoadingStateProps> = ({
  isLoading,
  children,
  loadingText = 'Loading...',
  size = 'medium',
  fullScreen = false,
  overlay = false
}) => {
  // If not loading, just render children
  if (!isLoading && !overlay) {
    return <>{children}</>;
  }
  
  // Determine spinner size
  const spinnerSizeClasses = {
    small: 'h-4 w-4 border-2',
    medium: 'h-8 w-8 border-2',
    large: 'h-12 w-12 border-3'
  };
  
  const spinnerClass = spinnerSizeClasses[size];
  
  // Loader content
  const loader = (
    <div className="flex flex-col items-center justify-center">
      <div className={`${spinnerClass} animate-spin rounded-full border-t-primary-500 border-primary-500 border-opacity-25`} />
      {loadingText && <p className="mt-2 text-sm text-gray-600">{loadingText}</p>}
    </div>
  );
  
  // Full-screen loader
  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-90">
        {loader}
      </div>
    );
  }
  
  // Overlay loader
  if (overlay) {
    return (
      <div className="relative">
        {children}
        
        {isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white bg-opacity-75">
            {loader}
          </div>
        )}
      </div>
    );
  }
  
  // Simple centered loader
  return (
    <div className="flex items-center justify-center p-8">
      {loader}
    </div>
  );
};

export default LoadingState;
