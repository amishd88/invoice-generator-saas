import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastProps {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
  onClose: (id: string) => void;
}

// Individual Toast component
const Toast: React.FC<ToastProps> = ({ id, message, type, duration = 5000, onClose }) => {
  // Set up auto-dismiss timer
  useEffect(() => {
    if (duration !== Infinity) {
      const timer = setTimeout(() => {
        onClose(id);
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [id, duration, onClose]);
  
  // Styles for different toast types
  const typeStyles = {
    success: 'bg-green-100 border-green-500 text-green-800',
    error: 'bg-red-100 border-red-500 text-red-800',
    warning: 'bg-yellow-100 border-yellow-500 text-yellow-800',
    info: 'bg-blue-100 border-blue-500 text-blue-800'
  };
  
  // Icons for different toast types
  const typeIcons = {
    success: (
      <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ),
    error: (
      <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
    warning: (
      <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    info: (
      <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  };
  
  return (
    <div
      className={`max-w-md w-full rounded-lg shadow-lg border-l-4 p-4 my-2 transform transition-all duration-300 ease-in-out ${typeStyles[type]}`}
      role="alert"
    >
      <div className="flex items-start">
        <div className="flex-shrink-0 pt-0.5">
          {typeIcons[type]}
        </div>
        <div className="ml-3 flex-1">
          <p className="text-sm">{message}</p>
        </div>
        <div className="ml-4 flex-shrink-0 flex">
          <button
            className="bg-transparent text-current focus:outline-none focus:text-gray-500 hover:text-gray-500"
            onClick={() => onClose(id)}
          >
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

// Collection of Toast notifications with context
export interface ToastData {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

// Create a global toast container
interface ToastContextType {
  addToast: (message: string, type: ToastType, duration?: number) => string;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}

export const ToastContext = React.createContext<ToastContextType>({
  addToast: () => '',
  removeToast: () => {},
  clearToasts: () => {}
});

// Toast container component
const ToastContainer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const [container, setContainer] = useState<HTMLElement | null>(null);
  
  // Create toast container on mount
  useEffect(() => {
    // Check if a container already exists
    let toastContainer = document.getElementById('toast-container');
    
    // If not, create one
    if (!toastContainer) {
      toastContainer = document.createElement('div');
      toastContainer.id = 'toast-container';
      toastContainer.className = 'fixed top-4 right-4 z-50 flex flex-col items-end space-y-2';
      document.body.appendChild(toastContainer);
    }
    
    setContainer(toastContainer);
    
    // Clean up on unmount
    return () => {
      if (toastContainer && toastContainer.parentNode === document.body) {
        document.body.removeChild(toastContainer);
      }
    };
  }, []);
  
  // Add a new toast
  const addToast = (message: string, type: ToastType, duration = 5000): string => {
    const id = Date.now().toString();
    const newToast: ToastData = { id, message, type, duration };
    
    setToasts(prevToasts => [...prevToasts, newToast]);
    return id;
  };
  
  // Remove a toast by ID
  const removeToast = (id: string) => {
    setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
  };
  
  // Clear all toasts
  const clearToasts = () => {
    setToasts([]);
  };
  
  // Context value
  const contextValue: ToastContextType = {
    addToast,
    removeToast,
    clearToasts
  };
  
  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      
      {container && createPortal(
        <div className="toast-list">
          {toasts.map((toast) => (
            <Toast
              key={toast.id}
              id={toast.id}
              message={toast.message}
              type={toast.type}
              duration={toast.duration}
              onClose={removeToast}
            />
          ))}
        </div>,
        container
      )}
    </ToastContext.Provider>
  );
};

// Hook for using toast in components
export const useToast = () => {
  const context = React.useContext(ToastContext);
  
  if (!context) {
    throw new Error('useToast must be used within a ToastContainer');
  }
  
  return context;
};

export default ToastContainer;
