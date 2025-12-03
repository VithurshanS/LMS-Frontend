import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { DashboardLayout, ModuleCard, EmptyState } from '../components';

export default function StudentDashboard() {
  const { currentUser, logout, enrollments, enrollInModule, getDepartmentModules } = useAuth();
  const navigate = useNavigate();
  const [enrolling, setEnrolling] = useState<string | null>(null);

  if (currentUser?.role !== 'STUDENT') {
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
    <DashboardLayout title="Student Dashboard">
      {/* Enrolled Modules Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">My Enrolled Modules</h2>
        {enrolledModules.length === 0 ? (
          <EmptyState message="You haven't enrolled in any modules yet." />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrolledModules.map(module => (
              <ModuleCard
                key={module.id}
                module={module}
                showLecturer={false}
                showProgress={false}
                actionButton={
                  <span className="inline-block px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full w-full text-center">
                    ✓ Enrolled
                  </span>
                }
              />
            ))}
          </div>
        )}
      </section>

      {/* Available Modules Section */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Available Modules</h2>
        {availableModules.length === 0 ? (
          <EmptyState message="No more modules available for enrollment." />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableModules.map(module => {
              const isFull = module.enrolledCount >= module.limit;
              const isEnrolling = enrolling === module.id;
              
              return (
                <ModuleCard
                  key={module.id}
                  module={module}
                  showLecturer={false}
                  actionButton={
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
                  }
                />
              );
            })}
          </div>
        )}
      </section>
    </DashboardLayout>
  );
}
