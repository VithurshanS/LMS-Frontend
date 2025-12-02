import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

type TabType = 'departments' | 'lecturers' | 'students';

export default function AdminDashboard() {
  const { currentUser, logout, departments, users, approveLecturer, getDepartmentModules, getDepartmentLecturers, createDepartment, createModule } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('departments');
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string | null>(null);
  const [showCreateDepartmentModal, setShowCreateDepartmentModal] = useState(false);
  const [showCreateModuleModal, setShowCreateModuleModal] = useState(false);
  const [newDepartmentName, setNewDepartmentName] = useState('');
  const [newModuleData, setNewModuleData] = useState({
    code: '',
    name: '',
    lecturerId: '',
    limit: 30
  });
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!currentUser) {
    navigate('/login');
    return null;
  }

  const lecturers = users.filter(u => u.role === 'LECTURER');
  const students = users.filter(u => u.role === 'STUDENT');

  const selectedDepartment = selectedDepartmentId 
    ? departments.find(d => d.id === selectedDepartmentId)
    : null;

  const departmentModules = selectedDepartmentId 
    ? getDepartmentModules(selectedDepartmentId)
    : [];

  const departmentLecturers = selectedDepartmentId
    ? getDepartmentLecturers(selectedDepartmentId)
    : [];

  const handleCreateDepartment = () => {
    if (!newDepartmentName.trim()) {
      alert('Department name is required');
      return;
    }
    createDepartment(newDepartmentName.trim());
    setNewDepartmentName('');
    setShowCreateDepartmentModal(false);
  };

  const handleCreateModule = () => {
    if (!selectedDepartmentId) return;
    
    if (!newModuleData.code.trim() || !newModuleData.name.trim() || !newModuleData.lecturerId) {
      alert('All fields are required');
      return;
    }

    createModule({
      code: newModuleData.code.trim(),
      name: newModuleData.name.trim(),
      departmentId: selectedDepartmentId,
      lecturerId: newModuleData.lecturerId,
      limit: newModuleData.limit
    });

    setNewModuleData({ code: '', name: '', lecturerId: '', limit: 30 });
    setShowCreateModuleModal(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
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

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex space-x-8">
            <button
              onClick={() => {
                setActiveTab('departments');
                setSelectedDepartmentId(null);
              }}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'departments'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Departments
            </button>
            <button
              onClick={() => {
                setActiveTab('lecturers');
                setSelectedDepartmentId(null);
              }}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'lecturers'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Lecturers
            </button>
            <button
              onClick={() => {
                setActiveTab('students');
                setSelectedDepartmentId(null);
              }}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'students'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Students
            </button>
          </nav>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Departments View */}
        {activeTab === 'departments' && (
          <div>
            {selectedDepartment ? (
              <div>
                <button
                  onClick={() => setSelectedDepartmentId(null)}
                  className="mb-4 text-blue-600 hover:text-blue-700 font-medium"
                >
                  ← Back to Departments
                </button>
                
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">{selectedDepartment.name}</h2>
                  <button
                    onClick={() => setShowCreateModuleModal(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    + Add Module
                  </button>
                </div>

                {/* Modules in Department */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Modules</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {departmentModules.map(module => {
                      const lecturer = users.find(u => u.id === module.lecturerId);
                      const isFull = module.enrolledCount >= module.limit;
                      
                      return (
                        <div key={module.id} className="bg-white rounded-lg shadow p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4 className="font-semibold text-gray-900">{module.name}</h4>
                              <p className="text-sm text-gray-600">{module.code}</p>
                            </div>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              isFull ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                            }`}>
                              {isFull ? 'Full' : 'Open'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            Capacity: {module.enrolledCount}/{module.limit}
                          </p>
                          {lecturer && (
                            <p className="text-sm text-gray-500">
                              Lecturer: {lecturer.firstName} {lecturer.lastName}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Lecturers in Department */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Lecturers</h3>
                  <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="min-w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {departmentLecturers.map(lecturer => (
                          <tr key={lecturer.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {lecturer.firstName} {lecturer.lastName}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                              {lecturer.email}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                lecturer.isActive ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                              }`}>
                                {lecturer.isActive ? 'Active' : 'Pending'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Departments</h2>
                  <button
                    onClick={() => setShowCreateDepartmentModal(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    + Add Department
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {departments.map(dept => {
                    const deptModules = getDepartmentModules(dept.id);
                    const deptLecturers = getDepartmentLecturers(dept.id);
                    
                    return (
                      <button
                        key={dept.id}
                        onClick={() => setSelectedDepartmentId(dept.id)}
                        className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow text-left"
                      >
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">{dept.name}</h3>
                        <div className="space-y-1 text-sm text-gray-600">
                          <p>{deptModules.length} Modules</p>
                          <p>{deptLecturers.length} Lecturers</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Lecturers View */}
        {activeTab === 'lecturers' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Lecturers</h2>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {lecturers.map(lecturer => {
                    const dept = departments.find(d => d.id === lecturer.departmentId);
                    
                    return (
                      <tr key={lecturer.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {lecturer.firstName} {lecturer.lastName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {lecturer.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {dept?.name || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            lecturer.isActive ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {lecturer.isActive ? 'Active' : 'Pending'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {!lecturer.isActive && (
                            <button
                              onClick={() => approveLecturer(lecturer.id)}
                              className="text-green-600 hover:text-green-700 font-medium"
                            >
                              Approve
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Students View */}
        {activeTab === 'students' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Students</h2>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Username</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {students.map(student => {
                    const dept = departments.find(d => d.id === student.departmentId);
                    
                    return (
                      <tr key={student.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {student.firstName} {student.lastName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {student.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {dept?.name || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {student.username}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Create Department Modal */}
      {showCreateDepartmentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Add New Department</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Department Name
              </label>
              <input
                type="text"
                value={newDepartmentName}
                onChange={(e) => setNewDepartmentName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Physics"
              />
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleCreateDepartment}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create
              </button>
              <button
                onClick={() => {
                  setShowCreateDepartmentModal(false);
                  setNewDepartmentName('');
                }}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Module Modal */}
      {showCreateModuleModal && selectedDepartment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Add Module to {selectedDepartment.name}
            </h3>
            <div className="space-y-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Module Code
                </label>
                <input
                  type="text"
                  value={newModuleData.code}
                  onChange={(e) => setNewModuleData({ ...newModuleData, code: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., CS301"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Module Name
                </label>
                <input
                  type="text"
                  value={newModuleData.name}
                  onChange={(e) => setNewModuleData({ ...newModuleData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Advanced Programming"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assign Lecturer
                </label>
                <select
                  value={newModuleData.lecturerId}
                  onChange={(e) => setNewModuleData({ ...newModuleData, lecturerId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select a lecturer</option>
                  {departmentLecturers.filter(l => l.isActive).map(lecturer => (
                    <option key={lecturer.id} value={lecturer.id}>
                      {lecturer.firstName} {lecturer.lastName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Student Limit
                </label>
                <input
                  type="number"
                  value={newModuleData.limit}
                  onChange={(e) => setNewModuleData({ ...newModuleData, limit: parseInt(e.target.value) || 30 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="1"
                  max="100"
                />
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleCreateModule}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Module
              </button>
              <button
                onClick={() => {
                  setShowCreateModuleModal(false);
                  setNewModuleData({ code: '', name: '', lecturerId: '', limit: 30 });
                }}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
