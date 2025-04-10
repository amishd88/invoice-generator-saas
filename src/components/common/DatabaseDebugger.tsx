import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

const DatabaseDebugger: React.FC = () => {
  const [dbInfo, setDbInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkTables = async () => {
      try {
        setIsLoading(true);
        console.log('Checking Supabase connection and tables...');
        
        // Check connection by getting the user
        const { data: userData, error: userError } = await supabase.auth.getUser();
        
        if (userError) {
          console.error('Auth error:', userError);
          setError(`Authentication error: ${userError.message}`);
          return;
        }
        
        console.log('Current user:', userData?.user);
        
        // Try to list available schemas
        let schemas: string[] = [];
        try {
          // This is just a test query to see if we can access any data
          const { data: schemaData, error: schemaError } = await supabase
            .from('invoices')
            .select('*')
            .limit(1);
          
          if (schemaError) {
            console.error('Error accessing invoices table:', schemaError);
            setError(`Database error: ${schemaError.message}`);
          } else {
            console.log('Successfully accessed invoices table');
          }
        } catch (err) {
          console.error('Error listing schemas:', err);
        }
        
        setDbInfo({
          user: userData?.user,
          schemas,
        });
      } catch (err) {
        console.error('Unexpected error:', err);
        setError(`Unexpected error: ${String(err)}`);
      } finally {
        setIsLoading(false);
      }
    };

    checkTables();
  }, []);

  return (
    <div style={{ display: 'none' }}>
      {/* This component doesn't render anything visible, it just runs the debug code */}
      {/* Debug info is output to the browser console */}
    </div>
  );
};

export default DatabaseDebugger;
