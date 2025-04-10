# DataMinds Invoice Generator

A powerful SaaS invoicing solution for freelancers and small businesses.

## Overview

DataMinds Invoice Generator is a modern, full-featured invoicing application built with React, TypeScript, and Supabase. It allows users to create, manage, and track invoices with a user-friendly interface.

## Features

- **User Authentication**: Secure login and registration system
- **Invoice Creation**: Easy-to-use invoice editor with customizable templates
- **Customer Management**: Track and manage customer information
- **Product Catalog**: Store frequently used products and services
- **Payment Tracking**: Monitor payment status and overdue invoices
- **Reporting**: Generate sales, outstanding invoice, and customer payment reports
- **Responsive Design**: Works on desktop and mobile devices

## Technical Stack

- **Frontend**: React.js with TypeScript
- **UI Framework**: Tailwind CSS
- **Database**: PostgreSQL (via Supabase)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage
- **Hosting**: Supabase Edge Functions

## Setup Instructions

1. Clone the repository
2. Install dependencies with `npm install`
3. Create a `.env` file with your Supabase credentials (see `.env.example`)
4. Run the development server with `npm run dev`
5. Set up the database schema by executing `consolidated_schema.sql` in your Supabase SQL editor

## Database Schema

The application uses a PostgreSQL database with the following main tables:

- `customers`: For storing customer information
- `products`: For cataloging products and services
- `invoices`: For storing invoice details
- `invoice_line_items`: For storing individual invoice items
- `invoice_payments`: For tracking payments against invoices

The complete schema is provided in `consolidated_schema.sql`.

## Authentication

The application uses Supabase Auth for user authentication. Row-Level Security (RLS) policies ensure users can only access their own data.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues, feature requests, or questions, please open an issue on GitHub.
