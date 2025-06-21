import React, { useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';

const LoginForm = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('http://localhost:8000/api/auth/token/', {
        username,
        password,
      });

      const { access, refresh } = response.data;

      Cookies.set('accessToken', access, { expires: 1 / 24 });
      Cookies.set('refreshToken', refresh, { expires: 7 });

      alert('Login successful!');
      if (onLoginSuccess) onLoginSuccess(access);

    } catch (err) {
      console.error('Login error:', err);
      alert('Invalid credentials');
    }
  };

  return (
    <div
      className="relative flex min-h-screen flex-col bg-white overflow-x-hidden"
      style={{ fontFamily: 'Inter, "Noto Sans", sans-serif' }}
    >
      <div className="flex h-full flex-col">
        {/* Header */}
        <header className="flex items-center justify-between border-b border-[#f0f2f5] px-10 py-3">
          <div className="flex items-center gap-4 text-[#111418]">
            <div className="w-4 h-4">
              <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M42.4379 44C42.4379 44 36.0744 33.9038 41.1692 24C46.8624 12.9336 42.2078 4 42.2078 4L7.01134 4C7.01134 4 11.6577 12.932 5.96912 23.9969C0.876273 33.9029 7.27094 44 7.27094 44L42.4379 44Z"
                  fill="currentColor"
                ></path>
              </svg>
            </div>
            <h2 className="text-lg font-bold tracking-[-0.015em]">TeamReview</h2>
          </div>
        </header>

        {/* Login Form */}
        <div className="flex flex-1 justify-center items-center py-5 px-4">
          <div className="w-full max-w-md bg-white shadow-md rounded-lg p-6">
            <h2 className="text-2xl font-bold text-center mb-6">Welcome back</h2>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <input
                  type="text"
                  placeholder="Email"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full rounded-lg bg-[#f0f2f5] text-[#111418] placeholder:text-[#60758a] h-12 px-4 text-base focus:outline-none"
                  required
                />
              </div>

              <div>
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg bg-[#f0f2f5] text-[#111418] placeholder:text-[#60758a] h-12 px-4 text-base focus:outline-none"
                  required
                />
              </div>

              <p className="text-[#60758a] text-sm underline text-right">Forgot password?</p>

              <button
                type="submit"
                className="w-full h-12 rounded-lg bg-[#0c7ff2] text-white text-base font-bold"
              >
                Log in
              </button>
            </form>

            <p className="text-[#60758a] text-sm text-center underline mt-4">
              Don't have an account? Sign up
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
