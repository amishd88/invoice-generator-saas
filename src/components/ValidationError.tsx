import React from 'react'

interface ValidationErrorProps {
  error?: string | string[]
  className?: string
}

const ValidationError: React.FC<ValidationErrorProps> = ({ error, className = '' }) => {
  if (!error) return null
  
  const baseClasses = 'text-red-600 text-sm mt-1 font-inter'
  const combinedClasses = `${baseClasses} ${className}`
  
  // Handle array of errors
  if (Array.isArray(error)) {
    if (error.length === 0) return null
    
    return (
      <div className={combinedClasses}>
        {error.map((err, index) => (
          err ? <div key={index}>{err}</div> : null
        ))}
      </div>
    )
  }
  
  // Handle single error string
  return <div className={combinedClasses}>{error}</div>
}

export default ValidationError
