'use client';

import { useState } from 'react';

export default function LoginPage() {
  const [state, setState] = useState({
    password: '',
    error: '',
    isLoading: false
  });

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
        window.location.href = '/invoice';
      } else {
        setState(prev => ({ ...prev, error: 'invalid password', isLoading: false }));
      }
    } catch {
      setState(prev => ({ ...prev, error: 'Failed to authenticate. Please try again.', isLoading: false }));
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setState(prev => ({ ...prev, password: e.target.value, error: '' }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold">
            invoice system access
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="password" className="sr-only">
                password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none rounded relative block w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 placeholder-neutral-500 dark:placeholder-neutral-400 text-neutral-900 dark:text-neutral-100 rounded-t-md focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:border-neutral-500 focus:z-10 sm:text-sm bg-transparent"
                placeholder="password"
                value={state.password}
                onChange={handlePasswordChange}
                autoFocus
              />
            </div>
          </div>

          {state.error && (
            <div className="text-red-500 text-sm text-center">{state.error}</div>
          )}

          <div>
            <button
              type="submit"
              disabled={state.isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-neutral-800 hover:bg-neutral-700 dark:bg-neutral-700 dark:hover:bg-neutral-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neutral-500 disabled:opacity-50"
            >
              {state.isLoading ? 'signing in...' : 'sign in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 