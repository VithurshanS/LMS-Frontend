import { useState, useEffect } from 'react';
import { useAuth, Department, Module, Profile } from '../../context/AuthContext';

type DepartmentViewProps = {
  departmentId: string;
  onBack: () => void;
};

export default function DepartmentView({ departmentId, onBack }: DepartmentViewProps) {
  const { 
    departments, 
    getDepartmentModules, 
    getDepartmentUsers, 
    profiles,
    createModule 
  } = useAuth();
  
  const [showCreateModule, setShowCreateModule] = useState(false);
  const [newModuleName, setNewModuleName] = useState('');
  const [newModuleCode, setNewModuleCode] = useState('');
  const [newModuleDesc, setNewModuleDesc] = useState('');
  const [newModuleMax, setNewModuleMax] = useState(50);
  const [newModuleLecturer, setNewModuleLecturer] = useState('');

  const department = departments.find(d => d.id === departmentId);
  const modules = getDepartmentModules(departmentId);
  const lecturers = getDepartmentUsers(departmentId, 'lecturer');
  const students = getDepartmentUsers(departmentId, 'student');
  const allLecturers = profiles.filter(p => p.role === 'lecturer' && p.is_approved);

  useEffect(() => {
    if (allLecturers.length > 0 && !newModuleLecturer) {
      setNewModuleLecturer(allLecturers[0].id);
    }
  }, [allLecturers, newModuleLecturer]);

  const handleCreateModule = async (e: React.FormEvent) => {
    e.preventDefault();

    const { error } = await createModule(
      departmentId,
      newModuleCode,
      newModuleName,
      newModuleDesc,
      newModuleMax,
      newModuleLecturer || undefined
    );

    if (!error) {
      setShowCreateModule(false);
      setNewModuleName('');
      setNewModuleCode('');
      setNewModuleDesc('');
      setNewModuleMax(50);
      setNewModuleLecturer('');
    }
  };

  const handleApproveUser = async (userId: string) => {
    // In a real app, you'd update the profiles array through the context
    // For now, just show an alert
    alert('User approval functionality would be implemented here');
  };

  const handleBanUser = async (userId: string) => {
    // In a real app, you'd update the profiles array through the context
    // For now, just show an alert
    alert('User ban functionality would be implemented here');
  };

  if (!department) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <button
            onClick={onBack}
            className="mb-2 text-blue-600 hover:text-blue-800"
          >
            Back to Dashboard
          </button>
          <h1 className="text-2xl font-bold text-gray-900">{department.name}</h1>
          <p className="text-sm text-gray-600">{department.code}</p>
          {department.description && (
            <p className="text-sm text-gray-700 mt-2">{department.description}</p>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">Modules</h2>
            <button
              onClick={() => setShowCreateModule(!showCreateModule)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              {showCreateModule ? 'Cancel' : 'Create Module'}
            </button>
          </div>

          {showCreateModule && (
            <form onSubmit={handleCreateModule} className="bg-white p-4 rounded shadow mb-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Module Name
                </label>
                <input
                  type="text"
                  required
                  value={newModuleName}
                  onChange={(e) => setNewModuleName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Module Code
                </label>
                <input
                  type="text"
                  required
                  value={newModuleCode}
                  onChange={(e) => setNewModuleCode(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newModuleDesc}
                  onChange={(e) => setNewModuleDesc(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Students
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  value={newModuleMax}
                  onChange={(e) => setNewModuleMax(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assign Lecturer
                </label>
                <select
                  value={newModuleLecturer}
                  onChange={(e) => setNewModuleLecturer(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">No lecturer</option>
                  {allLecturers.map((lect) => (
                    <option key={lect.id} value={lect.id}>
                      {lect.full_name}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
              >
                Create
              </button>
            </form>
          )}

          <div className="space-y-3">
            {modules.map((mod) => {
              const lecturer = allLecturers.find((l) => l.id === mod.lecturer_id);
              return (
                <div key={mod.id} className="bg-white p-4 rounded shadow">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-gray-900">{mod.name}</h3>
                      <p className="text-sm text-gray-600">{mod.code}</p>
                      {mod.description && (
                        <p className="text-sm text-gray-700 mt-2">{mod.description}</p>
                      )}
                      <p className="text-sm text-gray-600 mt-2">
                        Capacity: {mod.current_students} / {mod.max_students}
                      </p>
                      {lecturer && (
                        <p className="text-sm text-gray-600">
                          Lecturer: {lecturer.full_name}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Lecturers in Department</h2>
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
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {lecturers.map((lecturer) => (
                  <tr key={lecturer.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {lecturer.full_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {lecturer.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className={`px-2 py-1 rounded ${
                          lecturer.is_approved
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {lecturer.is_approved ? 'Approved' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                      {!lecturer.is_approved && (
                        <button
                          onClick={() => handleApproveUser(lecturer.id)}
                          className="text-green-600 hover:text-green-800"
                        >
                          Approve
                        </button>
                      )}
                      {lecturer.is_approved && (
                        <button
                          onClick={() => handleBanUser(lecturer.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Ban
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Students in Department</h2>
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
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {students.map((student) => (
                  <tr key={student.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {student.full_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {student.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                      <button
                        onClick={() => handleBanUser(student.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Ban
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
