import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function TestLogin() {
  const [email, setEmail] = useState('admin@ahauros.io');
  const [password, setPassword] = useState('admin123456');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult('');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) {
        setResult(`Error: ${error.message}`);
      } else {
        setResult(`
          Success! 
          User ID: ${data.user.id}
          Email: ${data.user.email}
          Role: ${data.user.email === 'admin@ahauros.io' ? 'admin' : 'user'}
          Session: ${data.session ? 'Active' : 'No session'}
        `);
      }
    } catch (err) {
      setResult(`Exception: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult('');

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
      });

      if (error) {
        setResult(`Registration Error: ${error.message}`);
      } else {
        setResult(`Registration Success! Check your email for confirmation. User ID: ${data.user?.id}`);
      }
    } catch (err) {
      setResult(`Registration Exception: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Test Login - Ahauros Dashboard
          </h2>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              />
            </div>
            <div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              />
            </div>
          </div>

          <div className="space-y-4">
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? "Logging in..." : "Test Login"}
            </button>
            
            <button
              type="button"
              onClick={handleRegister}
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? "Registering..." : "Test Register"}
            </button>
          </div>
        </form>

        {result && (
          <div className="mt-4 p-4 bg-gray-100 rounded-md">
            <h3 className="text-sm font-medium text-gray-900">Result:</h3>
            <pre className="mt-2 text-sm text-gray-600 whitespace-pre-wrap">{result}</pre>
          </div>
        )}

        <div className="mt-6 text-sm text-gray-600">
          <h3 className="font-medium">Test Users:</h3>
          <ul className="mt-2 space-y-1">
            <li>• admin@ahauros.io / admin123456 (Admin role)</li>
            <li>• test@ahauros.io / test123456 (User role)</li>
          </ul>
          <p className="mt-2 text-xs text-red-600">
            Note: Email confirmation may be required. Check your email for confirmation links.
          </p>
        </div>
      </div>
    </div>
  );
}
