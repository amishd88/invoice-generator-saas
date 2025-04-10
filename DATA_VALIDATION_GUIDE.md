# Data Validation Implementation Guide

This guide explains the data validation features implemented in the Invoice Generator application.

## Overview

The validation system ensures that:
- All required fields have values
- Numerical values (quantities, prices, tax rates) are valid
- At least one line item exists before saving or printing
- Invalid input is visually highlighted
- Clear error messages are shown for each validation issue

## Validation Features

### Form Field Validation

The application validates the following required fields:
- Company name and address
- Client name and address
- Invoice number
- Due date

### Line Item Validation

Each line item is validated for:
- Description (required)
- Quantity (must be a positive number)
- Price (must be a valid number)
- Tax rate (must be a valid percentage)

### Database Operations Validation

Before saving to the database:
- The entire invoice is validated
- The save button is disabled if validation fails
- Error messages explain what needs to be fixed

### Print/PDF Generation Validation

Before generating a PDF:
- The entire invoice is validated
- The application switches back to the editing mode if validation fails
- Error messages guide the user to fix issues

## How the Validation Works

1. **Input Validation**: 
   - Real-time visual feedback with red borders for invalid fields
   - Numerical inputs have appropriate min/max values and step constraints

2. **Form Submission Validation**:
   - The `validateInvoice()` function in `validation.ts` checks all fields
   - Returns an error object with specific field errors
   - UI displays these errors in relevant places

3. **Database Validation**:
   - Database operations call the validation function first
   - Prevents saving incomplete or invalid data
   - Shows specific error messages

## Technical Implementation

### Key Components

1. **`validation.ts`**: 
   - Contains validation utility functions
   - Exports a comprehensive `validateInvoice()` function
   - Provides type definitions for error objects

2. **`ValidationError.tsx`**:
   - Reusable component for displaying error messages
   - Handles both single errors and arrays of errors

3. **Form Components**: 
   - Accept validation errors as props
   - Apply visual styling to invalid fields
   - Display error messages next to relevant fields

### Validation Flow

1. User edits the invoice form
2. When attempting to save/print, validation is triggered
3. If validation fails:
   - Error messages appear
   - Invalid fields are highlighted
   - User must fix issues before proceeding
4. If validation passes:
   - The requested action (save/print) proceeds
   - Success message is shown

## Adding Custom Validation

To add new validation rules:

1. Update the `validateInvoice()` function in `validation.ts`
2. Add the new error field to the `ValidationErrors` interface
3. Pass the error to the relevant component
4. Display the error in the UI using the `ValidationError` component

## Best Practices

- Always call validation before saving or printing
- Always display clear error messages
- Use visual indicators for invalid fields (red borders, etc.)
- Prevent form submission if validation fails
- Provide guidance on how to fix validation errors
