import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

type ModuleWithEnrollments = {
  id: string;
  department_id: string;
  code: string;
  name: string;
  description?: string;
  max_students: number;
  current_students: number;
  lecturer_id: string | null;
  created_at: string;
  enrollment_count: number;
};

export default function LecturerDashboard() {
  const { profile, signOut, getLecturerModules, getModuleEnrollments } = useAuth();
  const [selectedModule, setSelectedModule] = useState<ModuleWithEnrollments | null>(null);
  const [enrolledStudents, setEnrolledStudents] = useState<any[]>([]);

  const lecturerModules = profile ? getLecturerModules(profile.id) : [];
  const modules: ModuleWithEnrollments[] = lecturerModules.map(mod => {
    const enrollments = getModuleEnrollments(mod.id);
    return { ...mod, enrollment_count: enrollments.length };
  });

  const handleModuleClick = (mod: ModuleWithEnrollments) => {
    setSelectedModule(mod);
    const enrollments = getModuleEnrollments(mod.id);
    setEnrolledStudents(enrollments.map(item => ({
      id: item.enrollment.id,
      enrolled_at: item.enrollment.enrolled_at,
      profiles: item.student
    })));
  };

  if (selectedModule) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <button
              onClick={() => {
                setSelectedModule(null);
                setEnrolledStudents([]);
              }}
              className="mb-2 text-blue-600 hover:text-blue-800"
            >
              Back to Modules
            </button>
            <h1 className="text-2xl font-bold text-gray-900">{selectedModule.name}</h1>
            <p className="text-sm text-gray-600">{selectedModule.code}</p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-white p-6 rounded shadow mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-2">Module Details</h2>
            {selectedModule.description && (
              <p className="text-gray-700 mb-4">{selectedModule.description}</p>
            )}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Max Students:</span>{' '}
                <span className="font-medium">{selectedModule.max_students}</span>
              </div>
              <div>
                <span className="text-gray-600">Current Students:</span>{' '}
                <span className="font-medium">{selectedModule.current_students}</span>
              </div>
              <div>
                <span className="text-gray-600">Enrollment Count:</span>{' '}
                <span className="font-medium">{selectedModule.enrollment_count}</span>
              </div>
              <div>
                <span className="text-gray-600">Available Slots:</span>{' '}
                <span className="font-medium">
                  {selectedModule.max_students - selectedModule.current_students}
                </span>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Enrolled Students</h2>
            {enrolledStudents.length === 0 ? (
              <div className="bg-white p-6 rounded shadow text-center text-gray-600">
                No students enrolled yet
              </div>
            ) : (
              <div className="bg-white rounded shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Enrolled At
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {enrolledStudents.map((enrollment: any) => (
                      <tr key={enrollment.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {enrollment.profiles.full_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {enrollment.profiles.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {new Date(enrollment.enrolled_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Lecturer Dashboard</h1>
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

      <div className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">My Modules</h2>

        {modules.length === 0 ? (
          <div className="bg-white p-6 rounded shadow text-center text-gray-600">
            You are not assigned to any modules yet
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {modules.map((mod) => (
              <button
                key={mod.id}
                onClick={() => handleModuleClick(mod)}
                className="bg-white p-4 rounded shadow hover:shadow-md transition text-left"
              >
                <h3 className="font-bold text-gray-900">{mod.name}</h3>
                <p className="text-sm text-gray-600">{mod.code}</p>
                {mod.description && (
                  <p className="text-sm text-gray-700 mt-2 line-clamp-2">{mod.description}</p>
                )}
                <div className="mt-3 flex justify-between text-sm text-gray-600">
                  <span>Students: {mod.enrollment_count}</span>
                  <span>Max: {mod.max_students}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
