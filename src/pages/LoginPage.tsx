import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { loginWithOidc, currentUser, isLoading } = useAuth();
  const navigate = useNavigate();


  useEffect(() => {
    if (currentUser && !isLoading) {
      const redirectPath = currentUser.role === 'ADMIN' ? '/admin' 
                        : currentUser.role === 'LECTURER' ? '/lecturer' 
                        : '/student';
      navigate(redirectPath, { replace: true });
    }
  }, [currentUser, isLoading, navigate]);


  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  const handleOidcLogin = async () => {
    try {
      await loginWithOidc();
    } catch (error) {
      alert('SSO login failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">University LMS</h1>
          <p className="text-gray-600">Learning Management System</p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Login</h2>
          
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-gray-600 mb-6">
                Sign in with your organization account
              </p>
              <button
                onClick={handleOidcLogin}
                className="w-full py-3 px-6 text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors shadow-sm"
              >
                Sign in with SSO
              </button>
            </div>
          </div>

          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/register')}
              className="text-blue-600 hover:text-blue-700 text-sm"
            >
              Don't have an account? Register
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

