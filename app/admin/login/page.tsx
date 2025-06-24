'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function AdminLoginPage() {
  const [state, setState] = useState({
    password: '',
    error: '',
    isLoading: false
  });
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState(prev => ({ ...prev, error: '', isLoading: true }));
    
    try {
      const response = await fetch('/api/invoice/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password: state.password }),
      });

      if (response.ok) {
        router.push('/admin');
      } else {
        setState(prev => ({ ...prev, error: 'invalid password', isLoading: false }));
      }
    } catch {
      setState(prev => ({ ...prev, error: 'failed to authenticate. please try again.', isLoading: false }));
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setState(prev => ({ ...prev, password: e.target.value, error: '' }));
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center px-4">
      <motion.div
        className="max-w-md w-full space-y-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div>
          <h2 className="mt-6 text-center text-3xl font-light lowercase">
            admin access
          </h2>
          <p className="mt-2 text-center text-sm text-neutral-600 dark:text-neutral-400 lowercase">
            enter your admin password to continue
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <div>
              <label htmlFor="password" className="sr-only">
                password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none relative block w-full px-3 py-2 border-b border-neutral-300 dark:border-neutral-700 placeholder-neutral-500 dark:placeholder-neutral-400 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-0 focus:border-neutral-500 dark:focus:border-neutral-400 sm:text-sm bg-transparent"
                placeholder="password"
                value={state.password}
                onChange={handlePasswordChange}
                autoFocus
              />
            </div>
          </div>

          {state.error && (
            <motion.div 
              className="text-red-500 text-sm text-center lowercase"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {state.error}
            </motion.div>
          )}

          <div>
            <button
              type="submit"
              disabled={state.isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-neutral-300 dark:border-neutral-700 text-sm font-medium text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 focus:outline-none focus:ring-0 disabled:opacity-50 transition-colors lowercase"
            >
              {state.isLoading ? 'signing in...' : 'sign in'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
} 