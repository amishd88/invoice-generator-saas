// This file contains sample test data that was previously hardcoded in the UI components
// It can be used for testing or as seed data if needed

export const TEST_CUSTOMERS = [
  { id: '1', name: 'Acme Corporation', email: 'contact@acme.com', phone: '555-123-4567', address: '123 Business St, Business City, BC 12345' },
  { id: '2', name: 'TechStart Inc.', email: 'info@techstart.com', phone: '555-987-6543', address: '456 Innovation Ave, Tech Town, TT 67890' },
  { id: '3', name: 'Design Masters', email: 'hello@designmasters.com', phone: '555-456-7890', address: '789 Creative Blvd, Artistic City, AC 54321' },
  { id: '4', name: 'Global Services Ltd', email: 'service@globalservices.com', phone: '555-789-0123', address: '321 Service Rd, Service City, SC 98765' },
  { id: '5', name: 'Digital Solutions', email: 'support@digitalsolutions.com', phone: '555-234-5678', address: '654 Digital Dr, Digital City, DC 45678' },
];

export const TEST_PRODUCTS = [
  { id: '1', name: 'Web Development', description: 'Professional web development services per hour', price: 125.00, taxRate: 10.00 },
  { id: '2', name: 'Logo Design', description: 'Custom logo design with multiple revisions', price: 450.00, taxRate: 8.50 },
  { id: '3', name: 'UI/UX Consultation', description: 'Expert UI/UX advice per hour', price: 150.00, taxRate: 10.00 },
  { id: '4', name: 'Server Maintenance', description: 'Monthly server maintenance and updates', price: 200.00, taxRate: 7.50 },
  { id: '5', name: 'Content Creation', description: 'Professional content writing per 1000 words', price: 120.00, taxRate: 5.00 },
];

export const TEST_INVOICES = [
  { id: '1', number: 'INV-2025-001', client: 'Acme Corp', amount: 2500, status: 'paid', date: '2025-03-15' },
  { id: '2', number: 'INV-2025-002', client: 'TechStart Inc', amount: 1800, status: 'sent', date: '2025-03-18' },
  { id: '3', number: 'INV-2025-003', client: 'Design Masters', amount: 3200, status: 'draft', date: '2025-03-20' },
  { id: '4', number: 'INV-2025-004', client: 'Global Services Ltd', amount: 5600, status: 'overdue', date: '2025-02-25' },
  { id: '5', number: 'INV-2025-005', client: 'Digital Solutions', amount: 1200, status: 'sent', date: '2025-03-10' },
];

// You can import this file for testing purposes like:
// import { TEST_CUSTOMERS, TEST_PRODUCTS, TEST_INVOICES } from '../test/test-data';
