import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase, Department, Profile } from '../lib/supabase';
import DepartmentView from './admin/DepartmentView';

export default function AdminDashboard() {
  const { profile, signOut } = useAuth();
  const [view, setView] = useState<'overview' | 'department'>('overview');
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [lecturers, setLecturers] = useState<Profile[]>([]);
  const [students, setStudents] = useState<Profile[]>([]);
  const [showCreateDept, setShowCreateDept] = useState(false);
  const [newDeptName, setNewDeptName] = useState('');
  const [newDeptCode, setNewDeptCode] = useState('');
  const [newDeptDesc, setNewDeptDesc] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const { data: depts } = await supabase
      .from('departments')
      .select('*')
      .order('name');

    const { data: lects } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'lecturer')
      .order('full_name');

    const { data: studs } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'student')
      .order('full_name');

    if (depts) setDepartments(depts);
    if (lects) setLecturers(lects);
    if (studs) setStudents(studs);
  };

  const handleCreateDepartment = async (e: React.FormEvent) => {
    e.preventDefault();

    const { error } = await supabase
      .from('departments')
      .insert({
        name: newDeptName,
        code: newDeptCode,
        description: newDeptDesc,
        created_by: profile?.id,
      });

    if (!error) {
      setShowCreateDept(false);
      setNewDeptName('');
      setNewDeptCode('');
      setNewDeptDesc('');
      loadData();
    }
  };

  const handleDepartmentClick = (deptId: string) => {
    setSelectedDepartmentId(deptId);
    setView('department');
  };

  if (view === 'department' && selectedDepartmentId) {
    return (
      <DepartmentView
        departmentId={selectedDepartmentId}
        onBack={() => {
          setView('overview');
          setSelectedDepartmentId(null);
          loadData();
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
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
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">Departments</h2>
            <button
              onClick={() => setShowCreateDept(!showCreateDept)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              {showCreateDept ? 'Cancel' : 'Create Department'}
            </button>
          </div>

          {showCreateDept && (
            <form onSubmit={handleCreateDepartment} className="bg-white p-4 rounded shadow mb-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department Name
                </label>
                <input
                  type="text"
                  required
                  value={newDeptName}
                  onChange={(e) => setNewDeptName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department Code
                </label>
                <input
                  type="text"
                  required
                  value={newDeptCode}
                  onChange={(e) => setNewDeptCode(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newDeptDesc}
                  onChange={(e) => setNewDeptDesc(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                type="submit"
                className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
              >
                Create
              </button>
            </form>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {departments.map((dept) => (
              <button
                key={dept.id}
                onClick={() => handleDepartmentClick(dept.id)}
                className="bg-white p-4 rounded shadow hover:shadow-md transition text-left"
              >
                <h3 className="font-bold text-gray-900">{dept.name}</h3>
                <p className="text-sm text-gray-600">{dept.code}</p>
                {dept.description && (
                  <p className="text-sm text-gray-500 mt-2">{dept.description}</p>
                )}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Lecturers</h2>
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Students</h2>
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
