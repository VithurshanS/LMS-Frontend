import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { DashboardLayout, ModuleCard, EmptyState, ModuleDetailModal } from '../components';
import { Module, Department } from '../types';
import { getModulebyStudentId, getDeptModuleDetails, getDepartmentById, enrolltoModule } from '../api/api';

export default function StudentDashboard() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState<string | null>(null);
  const [enrolledModules, setEnrolledModules] = useState<Module[]>([]);
  const [departmentModules, setDepartmentModules] = useState<Module[]>([]);
  const [department, setDepartment] = useState<Department | null>(null);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [showModuleModal, setShowModuleModal] = useState(false);

  useEffect(() => {
    if (currentUser?.role !== 'STUDENT') {
      navigate('/login');
      return;
    }
    fetchDashboardData();
  }, [currentUser, navigate]);

  const fetchDashboardData = async () => {
    if (!currentUser) return;

    setLoading(true);
    try {
      const [enrolled, deptModules, dept] = await Promise.all([
        getModulebyStudentId(currentUser.id),
        currentUser.departmentId ? getDeptModuleDetails(currentUser.departmentId) : Promise.resolve([]),
        currentUser.departmentId ? getDepartmentById(currentUser.departmentId) : Promise.resolve(null)
      ]);

      setEnrolledModules(enrolled);
      setDepartmentModules(deptModules);
      setDepartment(dept);
    } catch (error) {
      console.error('Failed to fetch student dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinMeeting = (module: Module) => {
    navigate(`/meeting?moduleId=${module.id}`, { state: { module } });
  };

  if (!currentUser || currentUser.role !== 'STUDENT') {
    return null;
  }

  if (loading) {
    return (
      <DashboardLayout title="Student Dashboard">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  const enrolledModuleIds = new Set(enrolledModules.map(m => m.id));
  const availableModules = departmentModules.filter(m => !enrolledModuleIds.has(m.id));

  const handleEnroll = async (moduleId: string) => {
    setEnrolling(moduleId);
    try {
      const success = await enrolltoModule({
        studentId: currentUser.id,
        moduleId
      });
      
      if (success) {
        alert('Successfully enrolled in the module!');
        await fetchDashboardData();
      } else {
        alert('Failed to enroll. Module may be full or you are already enrolled.');
      }
    } catch (error) {
      console.error('Enrollment error:', error);
      alert('An error occurred during enrollment.');
    } finally {
      setEnrolling(null);
    }
  };

  return (
    <DashboardLayout 
      title="Student Dashboard"
      headerActions={
        department && (
          <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
            {department.name}
          </span>
        )
      }
    >
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
            <span className="font-medium text-gray-600 w-32">Enrolled Modules:</span>
            <span className="text-gray-900">{enrolledModules.length}</span>
          </div>
        </div>
      </section>

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
                onClick={() => {
                  setSelectedModule(module);
                  setShowModuleModal(true);
                }}
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
              const hasLecturer = module.lecturerId;
              const isNotReady = !hasLecturer;
              const isFull = module.enrolledCount >= module.limit;
              const isEnrolling = enrolling === module.id;
              
              return (
                <ModuleCard
                  key={module.id}
                  module={module}
                  showLecturer={false}
                  onClick={() => {
                    setSelectedModule(module);
                    setShowModuleModal(true);
                  }}
                  actionButton={
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEnroll(module.id);
                      }}
                      disabled={isFull || isEnrolling || isNotReady}
                      className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                        isFull || isNotReady
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : isEnrolling
                          ? 'bg-blue-400 text-white cursor-wait'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {isEnrolling ? 'Enrolling...' : isNotReady ? 'Not Available' : isFull ? 'Module Full' : 'Enroll'}
                    </button>
                  }
                />
              );
            })}
          </div>
        )}
      </section>

      {/* Module Detail Modal */}
      {selectedModule && (
        <ModuleDetailModal
          isOpen={showModuleModal}
          onClose={() => {
            setShowModuleModal(false);
            setSelectedModule(null);
          }}
          module={selectedModule}
          showStudentsList={false}
          allowLecturerClick={false}
          allowLecturerAssignment={false}
          onModuleUpdate={fetchDashboardData}
          currentUser={currentUser || undefined}
          onJoinMeeting={handleJoinMeeting}
        />
      )}
    </DashboardLayout>
  );
}
