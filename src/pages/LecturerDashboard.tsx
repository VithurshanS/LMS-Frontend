import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ModuleCard from '../components/ModuleCard';
import EmptyState from '../components/EmptyState';

export default function LecturerDashboard() {
  const { currentUser, logout, modules, departments } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!currentUser || currentUser.role !== 'LECTURER') {
    navigate('/login');
    return null;
  }

  const lecturerModules = modules.filter(m => m.lecturerId === currentUser.id);
  const department = departments.find(d => d.id === currentUser.departmentId);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Lecturer Dashboard</h1>
              <p className="text-sm text-gray-600">
                {currentUser.firstName} {currentUser.lastName}
              </p>
              {department && (
                <p className="text-xs text-gray-500">{department.name}</p>
              )}
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Profile Section */}
        <section className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Profile</h2>
          <div className="space-y-2 text-sm">
            <div className="flex">
              <span className="font-medium text-gray-600 w-32">Name:</span>
              <span className="text-gray-900">{currentUser.firstName} {currentUser.lastName}</span>
            </div>
            <div className="flex">
              <span className="font-medium text-gray-600 w-32">Email:</span>
              <span className="text-gray-900">{currentUser.email}</span>
            </div>
            <div className="flex">
              <span className="font-medium text-gray-600 w-32">Username:</span>
              <span className="text-gray-900">{currentUser.username}</span>
            </div>
            <div className="flex">
              <span className="font-medium text-gray-600 w-32">Department:</span>
              <span className="text-gray-900">{department?.name || 'N/A'}</span>
            </div>
            <div className="flex">
              <span className="font-medium text-gray-600 w-32">Status:</span>
              <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                currentUser.isActive ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
              }`}>
                {currentUser.isActive ? 'Active' : 'Pending Approval'}
              </span>
            </div>
          </div>
        </section>

        {/* Assigned Modules Section */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">My Modules</h2>
          {lecturerModules.length === 0 ? (
            <EmptyState message="You have no assigned modules yet." />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {lecturerModules.map(module => (
                <ModuleCard
                  key={module.id}
                  module={module}
                  showLecturer={false}
                />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
