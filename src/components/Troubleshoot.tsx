import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const Troubleshoot: React.FC = () => {
  const [status, setStatus] = useState<{
    auth: string;
    database: string;
    tables: any[];
    error?: string;
  }>({
    auth: 'Checking...',
    database: 'Checking...',
    tables: [],
  });

  useEffect(() => {
    const runChecks = async () => {
      try {
        // Check authentication
        const { data: authData, error: authError } = await supabase.auth.getSession();
        
        if (authError) {
          setStatus(prev => ({ 
            ...prev, 
            auth: 'Failed', 
            error: `Auth error: ${authError.message}` 
          }));
          return;
        }
        
        setStatus(prev => ({ 
          ...prev, 
          auth: authData.session ? 'Authenticated' : 'Not authenticated' 
        }));

        // Try to list all tables
        try {
          // This is a simple way to check database connection
          const { data, error } = await supabase
            .from('invoices')
            .select('*')
            .limit(1);
          
          if (error) {
            if (error.code === '42P01') { // Table doesn't exist
              setStatus(prev => ({ 
                ...prev, 
                database: 'Connected, but tables missing',
                error: 'Database tables do not exist. Please run the setup script.'
              }));
            } else {
              setStatus(prev => ({ 
                ...prev, 
                database: 'Connection error', 
                error: `Database error: ${error.message}` 
              }));
            }
          } else {
            setStatus(prev => ({ 
              ...prev, 
              database: 'Connected successfully', 
              tables: data || [] 
            }));
          }
        } catch (err) {
          setStatus(prev => ({ 
            ...prev, 
            database: 'Connection failed',
            error: `Unexpected error: ${String(err)}`
          }));
        }
      } catch (err) {
        setStatus(prev => ({ 
          ...prev, 
          auth: 'Check failed',
          database: 'Check failed',
          error: `Unexpected error: ${String(err)}`
        }));
      }
    };

    runChecks();
  }, []);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">System Troubleshooter</h1>
      
      <div className="bg-white shadow overflow-hidden rounded-lg mb-6">
        <div className="px-4 py-5 sm:px-6">
          <h2 className="text-lg font-medium text-gray-900">System Status</h2>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
          <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-gray-500">Authentication</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {status.auth === 'Authenticated' ? (
                  <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                    {status.auth}
                  </span>
                ) : (
                  <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                    {status.auth}
                  </span>
                )}
              </dd>
            </div>
            
            <div>
              <dt className="text-sm font-medium text-gray-500">Database Connection</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {status.database === 'Connected successfully' ? (
                  <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                    {status.database}
                  </span>
                ) : (
                  <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                    {status.database}
                  </span>
                )}
              </dd>
            </div>
          </dl>
          
          {status.error && (
            <div className="mt-6 p-4 border border-red-300 rounded-md bg-red-50">
              <p className="text-sm text-red-700">{status.error}</p>
            </div>
          )}
          
          {status.tables.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Sample Data:</h3>
              <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-40 text-xs">
                {JSON.stringify(status.tables, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
      
      <div className="bg-white shadow overflow-hidden rounded-lg mb-6">
        <div className="px-4 py-5 sm:px-6">
          <h2 className="text-lg font-medium text-gray-900">Troubleshooting Steps</h2>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
          <ol className="list-decimal pl-5 space-y-4">
            <li className="text-sm text-gray-700">
              <strong>Restart the dev server</strong> - Sometimes a simple restart fixes the issue.
              <pre className="bg-gray-100 p-2 rounded mt-1 text-xs">
                npm run dev
              </pre>
            </li>
            
            <li className="text-sm text-gray-700">
              <strong>Clear browser cache</strong> - Use hard refresh (Ctrl+Shift+R or Cmd+Shift+R) or clear site data from developer tools.
            </li>
            
            <li className="text-sm text-gray-700">
              <strong>Check Supabase database</strong> - Verify your tables exist in the Supabase dashboard.
              <p className="mt-1">You may need to run the setup script in the SQL editor:</p>
              <pre className="bg-gray-100 p-2 rounded mt-1 text-xs overflow-auto max-h-40">
{`-- Create invoices table
CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_number TEXT NOT NULL,
  client TEXT NOT NULL,
  company TEXT NOT NULL,
  company_address TEXT,
  client_address TEXT,
  due_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  total_amount NUMERIC(10,2) DEFAULT 0,
  total_paid NUMERIC(10,2) DEFAULT 0,
  status TEXT DEFAULT 'draft',
  paid_date DATE,
  template_id TEXT,
  currency JSONB,
  show_shipping BOOLEAN DEFAULT false,
  show_discount BOOLEAN DEFAULT false,
  show_tax_column BOOLEAN DEFAULT false,
  show_signature BOOLEAN DEFAULT false,
  show_payment_details BOOLEAN DEFAULT false,
  shipping JSONB,
  taxes JSONB,
  notes TEXT,
  terms TEXT,
  logo TEXT,
  logo_zoom NUMERIC(5,2) DEFAULT 1.0,
  customer_id UUID,
  user_id UUID
);`}
              </pre>
            </li>
            
            <li className="text-sm text-gray-700">
              <strong>Check environment variables</strong> - Make sure your .env file has the correct Supabase credentials.
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default Troubleshoot;
