import { supabase } from '../../lib/supabaseClient';
import { AuthUser, AuthError, SignInCredentials, SignUpCredentials } from './types';

export const authService = {
  /**
   * Sign up a new user
   */
  async signUp({ email, password, fullName }: SignUpCredentials): Promise<{ user: AuthUser | null; error: AuthError | null }> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) {
        return { user: null, error: { message: error.message } };
      }

      return { user: data.user || null, error: null };
    } catch (err) {
      console.error('Signup error:', err);
      return { user: null, error: { message: 'An unexpected error occurred during sign up' } };
    }
  },

  /**
   * Sign in an existing user
   */
  async signIn({ email, password }: SignInCredentials): Promise<{ user: AuthUser | null; error: AuthError | null }> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { user: null, error: { message: error.message } };
      }

      return { user: data.user || null, error: null };
    } catch (err) {
      console.error('Signin error:', err);
      return { user: null, error: { message: 'An unexpected error occurred during sign in' } };
    }
  },

  /**
   * Sign out the current user
   */
  async signOut(): Promise<{ error: AuthError | null }> {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        return { error: { message: error.message } };
      }

      return { error: null };
    } catch (err) {
      console.error('Signout error:', err);
      return { error: { message: 'An unexpected error occurred during sign out' } };
    }
  },

  /**
   * Get the current user
   */
  async getCurrentUser(): Promise<{ user: AuthUser | null; error: AuthError | null }> {
    try {
      console.log('authService: Getting current user...')
      const { data, error } = await supabase.auth.getUser();
      
      if (error) {
        console.error('authService: Error getting current user:', error.message)
        return { user: null, error: { message: error.message } };
      }

      console.log('authService: Current user retrieved:', data.user ? `${data.user.email} (${data.user.id})` : 'No user')
      return { user: data.user || null, error: null };
    } catch (err) {
      console.error('Get current user error:', err);
      return { user: null, error: { message: 'An unexpected error occurred while fetching the current user' } };
    }
  },

  /**
   * Reset password
   */
  async resetPassword(email: string): Promise<{ error: AuthError | null }> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) {
        return { error: { message: error.message } };
      }

      return { error: null };
    } catch (err) {
      console.error('Reset password error:', err);
      return { error: { message: 'An unexpected error occurred during password reset' } };
    }
  },

  /**
   * Update password
   */
  async updatePassword(password: string): Promise<{ error: AuthError | null }> {
    try {
      const { error } = await supabase.auth.updateUser({
        password,
      });
      
      if (error) {
        return { error: { message: error.message } };
      }

      return { error: null };
    } catch (err) {
      console.error('Update password error:', err);
      return { error: { message: 'An unexpected error occurred during password update' } };
    }
  },

  /**
   * Set up auth state change listener
   */
  onAuthStateChange(callback: (user: AuthUser | null) => void) {
    return supabase.auth.onAuthStateChange((event, session) => {
      callback(session?.user || null);
    });
  }
};
