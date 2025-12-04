import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  DashboardLayout, 
  ModuleCard, 
  EmptyState, 
  StudentView, 
  ModuleView 
} from '../components';

export default function LecturerDashboard() {
  const { currentUser, logout, modules, departments, users, enrollments } = useAuth();
  const navigate = useNavigate();

  if (currentUser?.role !== 'LECTURER') {
    navigate('/login');
    return null;
  }

  const lecturerModules = modules.filter(m => m.lecturerId === currentUser.id);
  const department = departments.find(d => d.id === currentUser.departmentId);
  
  // Get all students in lecturer's department
  const departmentStudents = users.filter(u => 
    u.role === 'STUDENT' && u.departmentId === currentUser.departmentId
  );
  
  // Get all students enrolled in lecturer's modules
  const allEnrolledStudents = users.filter(u => 
    u.role === 'STUDENT' && 
    enrollments.some(e => 
      lecturerModules.some(m => m.id === e.moduleId) && e.studentId === u.id
    )
  );

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
          title="My Modules"
        />
      </section>

      {/* Students in My Modules Section */}
      <section className="mb-8">
        <StudentView
          students={allEnrolledStudents}
          departments={departments}
          modules={modules}
          enrollments={enrollments}
          title="Students in My Modules"
          showDepartment={true}
          showUsername={false}
          emptyMessage="No students enrolled in your modules yet"
        />
      </section>

      {/* Department Students Section */}
      <section>
        <StudentView
          students={departmentStudents}
          departments={departments}
          modules={modules}
          enrollments={enrollments}
          title={`Students in ${department?.name || 'Department'}`}
          showDepartment={false}
          showUsername={true}
          emptyMessage="No students in your department yet"
        />
      </section>
    </DashboardLayout>
  );
}
