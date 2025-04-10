# Supabase Integration Guide for Invoice Generator

This guide will help you set up the Supabase database integration for your Invoice Generator application.

## Overview

The integration allows you to:
- Save and retrieve invoices
- Manage customer details
- Store frequently used products/services in a catalog

## Setup Steps

### 1. Supabase Setup

1. **Run the SQL Schema:**
   - Log in to your Supabase dashboard at https://app.supabase.com
   - Go to your project with URL: `https://wjypayhcfesfopynzqed.supabase.co`
   - Navigate to the SQL Editor
   - Paste the contents of the `supabase-schema.sql` file
   - Run the query to create all necessary tables and sample data

2. **Check Environment Variables:**
   - Ensure your `.env` file contains the Supabase URL and anon key
   - The values should match:
     ```
     VITE_SUPABASE_URL=https://wjypayhcfesfopynzqed.supabase.co
     VITE_SUPABASE_ANON_KEY=yeyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndqeXBheWhjZmVzZm9weW56cWVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg4MTYxMDAsImV4cCI6MjA1NDM5MjEwMH0.UdKenGxWkbCQXArD7Q_A5muYMunCHpg2USj1KBhvCQs
     ```

### 2. Run the Application

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Start the Development Server:**
   ```bash
   npm run dev
   ```

3. **Access the Application:**
   - Open the provided local URL (typically http://localhost:5173)

## Using the Database Features

### 1. Accessing Database Management

- Click the "Show Database Manager" button at the top of the application
- This opens a panel with tabs for Invoices, Customers, and Products

### 2. Managing Invoices

- **Save Invoice:** Click "Save Invoice" in the Invoice Manager panel
- **Load Invoice:** Select a previously saved invoice from the list
- **Delete Invoice:** Click the trash icon next to any saved invoice

### 3. Managing Customers

- **Add Customer:** 
  - Go to the Customers tab in Database Manager
  - Click "Add Customer" and fill in the details
  
- **Use a Customer in an Invoice:**
  - While editing an invoice, click "Select Customer" next to the client field
  - Choose from your list of saved customers

- **Save Current Client as Customer:**
  - Click "Select Customer" and use the option at the bottom to save the current client information

### 4. Managing Products

- **Add Product:**
  - Go to the Products tab in Database Manager
  - Click "Add Product" and fill in the name, description, price, and tax rate

- **Add Product to Invoice:**
  - While editing an invoice, click "Add Item from Catalog"
  - Select the product to add it as a new line item

## Database Structure

The database consists of four main tables:

1. **customers** - Stores client information
2. **products** - Stores product/service catalog
3. **invoices** - Stores invoice data
4. **invoice_line_items** - Stores line items for each invoice

## Troubleshooting

- **Database Connection Issues:**
  - Ensure Supabase is running and your project is active
  - Verify your environment variables are correct
  - Check browser console for specific error messages

- **Missing Tables:**
  - Re-run the SQL schema to create any missing tables
  - Make sure the SQL query executed without errors

- **Data Not Loading:**
  - Refresh the application
  - Check browser console for specific error messages
  - Verify the SQL schema was properly executed
