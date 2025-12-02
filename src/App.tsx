import { useAuth } from './context/AuthContext';
import LandingPage from './components/LandingPage';
import AdminDashboard from './components/AdminDashboard';
import LecturerDashboard from './components/LecturerDashboard';
import StudentDashboard from './components/StudentDashboard';

function App() {
  const { user, profile, loading, signOut } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (!user || !profile) {
    return <LandingPage />;
  }

  if (!profile.is_approved && profile.role === 'lecturer') {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white shadow rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Account Pending Approval</h2>
          <p className="text-gray-600 mb-6">
            Your lecturer account is pending admin approval. Please wait for an administrator to approve your account before you can access the system.
          </p>
          <button
            onClick={() => signOut()}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition"
          >
            Logout
          </button>
        </div>
      </div>
    );
  }

  if (profile.role === 'admin') {
    return <AdminDashboard />;
  }

  if (profile.role === 'lecturer') {
    return <LecturerDashboard />;
  }

  if (profile.role === 'student') {
    return <StudentDashboard />;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <p className="text-gray-600">Invalid user role</p>
    </div>
  );
}

export default App;
