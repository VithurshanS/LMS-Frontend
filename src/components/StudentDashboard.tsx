import { useState } from 'react';
import { useAuth, Module, Department } from '../context/AuthContext';

type ModuleWithDepartment = Module & {
  department: Department;
  is_enrolled: boolean;
};

export default function StudentDashboard() {
  const { profile, signOut, userDepartments, departments, modules, enrollments, enrollStudent } = useAuth();
  const [loading, setLoading] = useState(false);

  if (!profile) return null;

  // Get student's department
  const studentDept = userDepartments.find(ud => ud.user_id === profile.id);
  const userDepartmentId = studentDept?.department_id;

  // Get modules in student's department
  const departmentModules = modules.filter(m => m.department_id === userDepartmentId);
  
  // Get student's enrollments
  const studentEnrollments = enrollments.filter(e => e.student_id === profile.id);
  const enrolledModuleIds = new Set(studentEnrollments.map(e => e.module_id));

  // Separate enrolled and available modules
  const modsWithDepartment: ModuleWithDepartment[] = departmentModules.map(mod => {
    const dept = departments.find(d => d.id === mod.department_id)!;
    return {
      ...mod,
      department: dept,
      is_enrolled: enrolledModuleIds.has(mod.id)
    };
  });

  const enrolledModules = modsWithDepartment.filter(m => m.is_enrolled);
  const availableModules = modsWithDepartment.filter(m => !m.is_enrolled);

  const handleEnroll = async (moduleId: string) => {
    if (!profile) return;

    setLoading(true);

    const module = availableModules.find((m) => m.id === moduleId);
    if (!module) {
      setLoading(false);
      return;
    }

    if (module.current_students >= module.max_students) {
      alert('This module is full');
      setLoading(false);
      return;
    }

    const { error } = await enrollStudent(profile.id, moduleId);

    if (error) {
      alert('Failed to enroll: ' + error.message);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Student Dashboard</h1>
            <p className="text-sm text-gray-600">{profile?.full_name}</p>
          </div>
          <button
            onClick={() => signOut()}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">My Enrolled Modules</h2>

          {enrolledModules.length === 0 ? (
            <div className="bg-white p-6 rounded shadow text-center text-gray-600">
              You are not enrolled in any modules yet
            </div>
          ) : (
            <div className="space-y-3">
              {enrolledModules.map((mod) => (
                <div key={mod.id} className="bg-white p-4 rounded shadow">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-gray-900">{mod.name}</h3>
                      <p className="text-sm text-gray-600">{mod.code}</p>
                      {mod.description && (
                        <p className="text-sm text-gray-700 mt-2">{mod.description}</p>
                      )}
                      <p className="text-sm text-gray-600 mt-2">
                        Department: {mod.department.name} ({mod.department.code})
                      </p>
                      <p className="text-sm text-gray-600">
                        Enrolled: {mod.current_students} / {mod.max_students}
                      </p>
                    </div>
                    <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded">
                      Enrolled
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Available Modules in My Department</h2>

          {modules.length === 0 ? (
            <div className="bg-white p-6 rounded shadow text-center text-gray-600">
              No more modules available to enroll
            </div>
          ) : (
            <div className="space-y-3">
              {availableModules.map((mod) => {
                const isFull = mod.current_students >= mod.max_students;

                return (
                  <div key={mod.id} className="bg-white p-4 rounded shadow">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900">{mod.name}</h3>
                        <p className="text-sm text-gray-600">{mod.code}</p>
                        {mod.description && (
                          <p className="text-sm text-gray-700 mt-2">{mod.description}</p>
                        )}
                        <p className="text-sm text-gray-600 mt-2">
                          Department: {mod.department.name} ({mod.department.code})
                        </p>
                        <p className="text-sm text-gray-600">
                          Enrolled: {mod.current_students} / {mod.max_students}
                        </p>
                        {isFull && (
                          <p className="text-sm text-red-600 mt-1">Module is full</p>
                        )}
                      </div>
                      <button
                        onClick={() => handleEnroll(mod.id)}
                        disabled={loading || isFull}
                        className={`px-4 py-2 rounded transition ${
                          isFull
                            ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                      >
                        {loading ? 'Enrolling...' : 'Enroll'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
