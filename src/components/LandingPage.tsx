import { useState } from 'react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

export default function LandingPage() {
  const [view, setView] = useState<'home' | 'login' | 'register'>('home');

  if (view === 'login') {
    return <LoginForm onBack={() => setView('home')} />;
  }

  if (view === 'register') {
    return <RegisterForm onBack={() => setView('home')} onSuccess={() => setView('login')} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900">University LMS</h1>
          <p className="mt-2 text-gray-600">Learning Management System</p>
        </div>

        <div className="bg-white shadow rounded-lg p-8 space-y-4">
          <button
            onClick={() => setView('login')}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded hover:bg-blue-700 transition"
          >
            Login
          </button>

          <button
            onClick={() => setView('register')}
            className="w-full bg-gray-100 text-gray-800 py-3 px-4 rounded hover:bg-gray-200 transition"
          >
            Register
          </button>
        </div>
      </div>
    </div>
  );
}
