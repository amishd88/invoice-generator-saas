# Error Handling Guide

This guide explains the error handling system implemented in the Invoice Generator application.

## Overview

The error handling system provides:
- User-friendly error messages
- Consistent error format across the application
- Visual indicators for form validation
- Error recovery suggestions
- Centralized notification system

## Components

### 1. Error Components

#### ErrorMessage Component
Located at `src/components/common/ErrorMessage.tsx`, this component displays error messages with:
- Clear visual styling (red background, error icon)
- Dismissible functionality
- Responsive layout
- Accessible design

#### Notification System
Located at `src/components/common/NotificationContext.tsx` and `src/components/common/Notification.tsx`, this system:
- Manages transient notifications (success, error, warning, info)
- Allows setting custom durations
- Supports stacked notifications
- Provides auto-dismiss functionality

### 2. Form Validation

The application uses a comprehensive validation approach:
- Real-time field validation
- Submit-time form validation
- Clear error indicators
- Specific error messages
- Focus management for invalid fields

### 3. API Error Handling

API calls include structured error handling:
- Consistent error format from all services
- Detailed error information
- Network error detection
- Retry mechanisms where appropriate
- Fallback behavior when services are unavailable

## Implementation

### Error Message Display

Example of showing an error message:

```tsx
import ErrorMessage from '../components/common/ErrorMessage';

function MyComponent() {
  const [error, setError] = useState<string | null>(null);
  
  // Later in your component...
  if (error) {
    return <ErrorMessage message={error} onDismiss={() => setError(null)} />;
  }
}
```

### Using the Notification System

Example of using the notification context:

```tsx
import { useNotification } from '../components/common/NotificationContext';

function MyComponent() {
  const { showNotification } = useNotification();
  
  const handleAction = async () => {
    try {
      // Perform some action
      await saveData();
      showNotification('success', 'Data saved successfully!');
    } catch (error) {
      showNotification('error', `Failed to save data: ${error.message}`);
    }
  };
}
```

### Form Validation Implementation

```tsx
// Example form validation
const validateForm = () => {
  const errors = {};
  
  if (!formData.name) {
    errors.name = 'Name is required';
  }
  
  if (!formData.email) {
    errors.email = 'Email is required';
  } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
    errors.email = 'Email format is invalid';
  }
  
  setValidationErrors(errors);
  return Object.keys(errors).length === 0;
};

// Usage
const handleSubmit = (e) => {
  e.preventDefault();
  if (validateForm()) {
    // Proceed with form submission
  }
};
```

## Best Practices

### 1. User-Friendly Error Messages

- Use plain language, not technical jargon
- Explain what went wrong
- Suggest how to fix the issue
- Maintain a respectful tone

Examples:
- ❌ "Error 500: Internal server error"
- ✅ "We couldn't save your invoice. Please try again in a few moments."

### 2. Field-Level Validation

- Validate as users type (after initial focus loss)
- Show errors near the relevant field
- Use clear visual indicators (red borders, error icons)
- Explain validation rules upfront

### 3. Error Recovery

- Provide clear next steps
- Avoid dead ends
- Offer alternative actions when primary action fails
- Preserve user input during errors

### 4. Authentication Errors

Special handling for authentication-related errors:
- Clear distinction between login failures and session expiration
- Secure error messages (not revealing whether username or password was incorrect)
- Automatic redirection to login when session expires
- Rate limiting for failed login attempts with clear messaging

## Error Categories and Handling

### 1. Validation Errors

- **Source**: Client-side validation, server response
- **Handling**: Immediate feedback, highlight affected fields
- **Recovery**: Clear instructions on fixing the input

### 2. Network Errors

- **Source**: API calls, service connectivity
- **Handling**: Notification with retry option
- **Recovery**: Background retries, offline mode where possible

### 3. Authentication Errors

- **Source**: Login attempts, token expiration
- **Handling**: Redirect to login, preserve return path
- **Recovery**: Auto-refresh tokens when possible

### 4. Permission Errors

- **Source**: Attempting unauthorized actions
- **Handling**: Clear explanation of permissions needed
- **Recovery**: Request access option or alternative action

### 5. System Errors

- **Source**: Unexpected application errors
- **Handling**: User-friendly message with error reference
- **Recovery**: Application restart option, report error functionality

## Logging and Monitoring

For developers, the error system includes:
- Console logging of detailed error information
- Error categorization for analytics
- Non-blocking error reporting to backend services
- User behavior tracking around errors for improvement

## Testing Error Scenarios

Guidelines for testing error handling:
1. Test each form with invalid inputs
2. Simulate network failures during API calls
3. Test authentication expiration scenarios
4. Verify error messages are clear and helpful
5. Ensure errors are dismissible and don't block the application
6. Test recovery paths from each error scenario

## Future Improvements

Planned enhancements to the error handling system:
1. Expanded offline support with error queuing
2. Enhanced error analytics
3. AI-powered error resolution suggestions
4. More granular field validation with pattern assistance
5. Context-aware error messages based on user experience level
