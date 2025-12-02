import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function StudentDashboard() {
  const { currentUser, logout, enrollments, enrollInModule, getDepartmentModules } = useAuth();
  const navigate = useNavigate();
  const [enrolling, setEnrolling] = useState<string | null>(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!currentUser || currentUser.role !== 'STUDENT') {
    navigate('/login');
    return null;
  }

  const studentEnrollments = enrollments.filter(e => e.studentId === currentUser.id);
  const enrolledModuleIds = new Set(studentEnrollments.map(e => e.moduleId));

  const departmentModules = currentUser.departmentId 
    ? getDepartmentModules(currentUser.departmentId)
    : [];

  const availableModules = departmentModules.filter(m => !enrolledModuleIds.has(m.id));
  const enrolledModules = departmentModules.filter(m => enrolledModuleIds.has(m.id));

  const handleEnroll = async (moduleId: string) => {
    setEnrolling(moduleId);
    try {
      const success = enrollInModule(currentUser.id, moduleId);
      if (!success) {
        alert('Failed to enroll. Module may be full or you are already enrolled.');
      }
    } catch (error) {
      alert('An error occurred during enrollment.');
    } finally {
      setEnrolling(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Student Dashboard</h1>
              <p className="text-sm text-gray-600">
                {currentUser.firstName} {currentUser.lastName}
              </p>
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
        {/* Enrolled Modules Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">My Enrolled Modules</h2>
          {enrolledModules.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <p className="text-gray-600">You haven't enrolled in any modules yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrolledModules.map(module => (
                <div key={module.id} className="bg-white rounded-lg shadow-md p-6">
                  <div className="mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">{module.name}</h3>
                    <p className="text-sm text-gray-600">{module.code}</p>
                  </div>
                  <span className="inline-block px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full">
                    Enrolled
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Available Modules Section */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Available Modules</h2>
          {availableModules.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <p className="text-gray-600">No more modules available for enrollment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableModules.map(module => {
                const isFull = module.enrolledCount >= module.limit;
                const isEnrolling = enrolling === module.id;
                
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
                      <p className="text-sm text-gray-600 mt-2">
                        Capacity: {module.enrolledCount}/{module.limit}
                      </p>
                    </div>
                    <button
                      onClick={() => handleEnroll(module.id)}
                      disabled={isFull || isEnrolling}
                      className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                        isFull
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : isEnrolling
                          ? 'bg-blue-400 text-white cursor-wait'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {isEnrolling ? 'Enrolling...' : isFull ? 'Module Full' : 'Enroll'}
                    </button>
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
