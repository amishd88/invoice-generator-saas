import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase, fetchFromSupabase } from '../lib/supabaseClient';
import { useAuth } from '../services/auth/AuthContext';
import UpgradeModal from '../components/common/UpgradeModal';

// Types
export type PlanType = 'free' | 'premium';

interface SubscriptionContextType {
  plan: PlanType;
  isLoading: boolean;
  remainingFreeInvoices: number;
  canCreateInvoice: boolean;
  openUpgradeModal: () => void;
  closeUpgradeModal: () => void;
  upgradeToPremium: () => Promise<void>;
  refreshSubscriptionData: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

// Provider Component
export const SubscriptionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [plan, setPlan] = useState<PlanType>('free');
  const [isLoading, setIsLoading] = useState(true);
  const [remainingFreeInvoices, setRemainingFreeInvoices] = useState(5);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  
  // Free tier limits
  const FREE_TIER_INVOICE_LIMIT = 5;

  // Load subscription data when user changes
  useEffect(() => {
    let mounted = true;
    
    if (user) {
      // Add a small delay to ensure auth token is ready
      setTimeout(() => {
        if (mounted) {
          refreshSubscriptionData();
        }
      }, 100);
    } else {
      // Reset to defaults when user is logged out
      setPlan('free');
      setRemainingFreeInvoices(FREE_TIER_INVOICE_LIMIT);
      setIsLoading(false);
    }
    
    return () => {
      mounted = false;
    };
  }, [user]);

  // Function to refresh subscription data
  const refreshSubscriptionData = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // First check if we have a valid session
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        console.warn('No valid session found, defaulting to free plan');
        setPlan('free');
        setIsLoading(false);
        return;
      }
      
      // Get user subscription info using direct fetch
      try {
        const subscriptionData = await fetchFromSupabase(
          `/rest/v1/user_subscriptions?select=plan,subscription_end_date&user_id=eq.${user.id}`,
          { method: 'GET' }
        );
        
        if (subscriptionData && subscriptionData.length > 0) {
          // Check if subscription is valid (not expired)
          const isSubscriptionValid = subscriptionData[0].subscription_end_date 
            ? new Date(subscriptionData[0].subscription_end_date) > new Date() 
            : false;
          
          setPlan(isSubscriptionValid ? subscriptionData[0].plan as PlanType : 'free');
        } else {
          // No subscription data found, set to free plan
          setPlan('free');
        }
      } catch (error) {
        console.error('Error fetching subscription data:', error);
        setPlan('free');
      }
      
      // If on free plan, count current month's invoices
      if (plan === 'free') {
        const currentMonth = new Date().getMonth() + 1; // 1-12
        const currentYear = new Date().getFullYear();
        
        // Get first and last day of current month
        const firstDay = new Date(currentYear, currentMonth - 1, 1).toISOString();
        const lastDay = new Date(currentYear, currentMonth, 0).toISOString();
        
        try {
          // Count invoices created this month using direct fetch
          const countResult = await fetchFromSupabase(
            `/rest/v1/invoices?select=id&user_id=eq.${user.id}&created_at=gte.${firstDay}&created_at=lte.${lastDay}`,
            { method: 'GET' }
          );
          
          const invoiceCount = countResult ? countResult.length : 0;
          setRemainingFreeInvoices(Math.max(0, FREE_TIER_INVOICE_LIMIT - invoiceCount));
        } catch (error) {
          console.error('Error counting invoices:', error);
          setRemainingFreeInvoices(FREE_TIER_INVOICE_LIMIT); // Default to full amount on error
        }
      } else {
        // For premium users, no limit
        setRemainingFreeInvoices(999);
      }
    } catch (err) {
      console.error('Error refreshing subscription data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to upgrade to premium (placeholder for future Stripe integration)
  const upgradeToPremium = async () => {
    // This would typically initiate the Stripe checkout process
    // For now, we'll just simulate an upgrade
    try {
      if (!user) throw new Error('User must be logged in to upgrade');
      
      // Set end date to 1 year from now
      const endDate = new Date();
      endDate.setFullYear(endDate.getFullYear() + 1);
      
      // Update or insert subscription record using direct API call
      const payload = {
        user_id: user.id,
        plan: 'premium',
        subscription_start_date: new Date().toISOString(),
        subscription_end_date: endDate.toISOString(),
      };
      
      await fetchFromSupabase('/rest/v1/user_subscriptions', {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: {
          'Prefer': 'resolution=merge-duplicates'
        }
      });
      
      // Update local state
      setPlan('premium');
      closeUpgradeModal();
      
      // Return success
      return Promise.resolve();
    } catch (err) {
      console.error('Error upgrading to premium:', err);
      return Promise.reject(err);
    }
  };

  // Modal control functions
  const openUpgradeModal = () => setShowUpgradeModal(true);
  const closeUpgradeModal = () => setShowUpgradeModal(false);

  // Compute whether user can create an invoice
  const canCreateInvoice = plan === 'premium' || remainingFreeInvoices > 0;

  // Context value
  const value = {
    plan,
    isLoading,
    remainingFreeInvoices,
    canCreateInvoice,
    openUpgradeModal,
    closeUpgradeModal,
    upgradeToPremium,
    refreshSubscriptionData,
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
      {showUpgradeModal && <UpgradeModal onClose={closeUpgradeModal} onUpgrade={upgradeToPremium} />}
    </SubscriptionContext.Provider>
  );
};

// Custom hook for using the subscription context
export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};
