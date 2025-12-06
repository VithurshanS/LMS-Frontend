import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  DashboardLayout, 
  StudentView, 
  ModuleView 
} from '../components';
import { Module, Department } from '../types';
import { getModulesbyLecturerId, getDepartmentById, getAllDepartmentStudents } from '../api/api';

export default function LecturerDashboard() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [lecturerModules, setLecturerModules] = useState<Module[]>([]);
  const [department, setDepartment] = useState<Department | null>(null);
  const [departmentStudents, setDepartmentStudents] = useState<any[]>([]);

  useEffect(() => {
    if (currentUser?.role !== 'LECTURER') {
      navigate('/login');
      return;
    }
    fetchDashboardData();
  }, [currentUser, navigate]);

  const fetchDashboardData = async () => {
    if (!currentUser) return;
    
    setLoading(true);
    try {
      const [modules, dept, students] = await Promise.all([
        getModulesbyLecturerId(currentUser.id),
        currentUser.departmentId ? getDepartmentById(currentUser.departmentId) : Promise.resolve(null),
        currentUser.departmentId ? getAllDepartmentStudents(currentUser.departmentId) : Promise.resolve([])
      ]);

      setLecturerModules(modules);
      setDepartment(dept);
      setDepartmentStudents(students);
    } catch (error) {
      console.error('Failed to fetch lecturer dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinMeeting = (module: Module) => {
    navigate(`/meeting?moduleId=${module.id}`, { state: { module } });
  };

  if (!currentUser || currentUser.role !== 'LECTURER') {
    return null;
  }

  if (loading) {
    return (
      <DashboardLayout title="Lecturer Dashboard">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout 
      title="Lecturer Dashboard"
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
            <span className="font-medium text-gray-600 w-32">Status:</span>
            <span className={`inline-block px-2 py-1 text-xs rounded-full ${
              currentUser.isActive ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
            }`}>
              {currentUser.isActive ? 'Active' : 'Pending Approval'}
            </span>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <ModuleView
          modules={lecturerModules}
          title="My Teaching Modules"
          emptyMessage="No modules assigned yet"
          onModuleUpdate={fetchDashboardData}
          currentUser={currentUser || undefined}
          onJoinMeeting={handleJoinMeeting}
        />
      </section>

      {/* Department Students Section */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Students in {department?.name || 'Department'}
        </h2>
        <StudentView
          students={departmentStudents}
          departments={department ? [department] : []}
          currentUser={currentUser || undefined}
        />
      </section>
    </DashboardLayout>
  );
}
