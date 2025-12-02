import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

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
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <p className="text-gray-600">You have no assigned modules yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {lecturerModules.map(module => {
                const isFull = module.enrolledCount >= module.limit;
                const capacity = `${module.enrolledCount}/${module.limit}`;
                
                return (
                  <div key={module.id} className="bg-white rounded-lg shadow-md p-6">
                    <div className="mb-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{module.name}</h3>
                          <p className="text-sm text-gray-600">{module.code}</p>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          isFull ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                        }`}>
                          {isFull ? 'Full' : 'Open'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex justify-between">
                        <span>Enrolled Students:</span>
                        <span className="font-medium text-gray-900">{module.enrolledCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Capacity:</span>
                        <span className="font-medium text-gray-900">{capacity}</span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-4">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            isFull ? 'bg-red-600' : 'bg-green-600'
                          }`}
                          style={{
                            width: `${Math.min((module.enrolledCount / module.limit) * 100, 100)}%`
                          }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
