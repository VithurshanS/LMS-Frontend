import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

type TabType = 'departments' | 'lecturers' | 'students';

export default function AdminDashboard() {
  const { currentUser, logout, departments, users, approveLecturer, getDepartmentModules, getDepartmentLecturers, createDepartment, createModule, modules, enrollments } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('departments');
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string | null>(null);
  const [showCreateDepartmentModal, setShowCreateDepartmentModal] = useState(false);
  const [showCreateModuleModal, setShowCreateModuleModal] = useState(false);
  const [showUserDetailModal, setShowUserDetailModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<typeof users[0] | null>(null);
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

  const handleUserClick = (user: typeof users[0]) => {
    setSelectedUser(user);
    setShowUserDetailModal(true);
  };

  const getUserModules = (user: typeof users[0]) => {
    if (user.role === 'LECTURER') {
      return modules.filter(m => m.lecturerId === user.id);
    } else if (user.role === 'STUDENT') {
      const studentEnrollments = enrollments.filter(e => e.studentId === user.id);
      return studentEnrollments.map(enrollment => 
        modules.find(m => m.id === enrollment.moduleId)
      ).filter(Boolean);
    }
    return [];
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
                      <tr key={lecturer.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => handleUserClick(lecturer)}>
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
                              onClick={(e) => {
                                e.stopPropagation();
                                approveLecturer(lecturer.id);
                              }}
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
                      <tr key={student.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => handleUserClick(student)}>
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
      
      {/* User Detail Modal */}
      {showUserDetailModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">
                  {selectedUser.firstName} {selectedUser.lastName}
                </h3>
                <span className={`inline-block mt-2 px-3 py-1 text-sm rounded-full ${
                  selectedUser.role === 'ADMIN' 
                    ? 'bg-purple-100 text-purple-700'
                    : selectedUser.role === 'LECTURER'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-green-100 text-green-700'
                }`}>
                  {selectedUser.role}
                </span>
              </div>
              <button
                onClick={() => {
                  setShowUserDetailModal(false);
                  setSelectedUser(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* User Information */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h4 className="font-semibold text-gray-900 mb-3">Personal Information</h4>
              <div className="space-y-2 text-sm">
                <div className="flex">
                  <span className="font-medium text-gray-600 w-32">Username:</span>
                  <span className="text-gray-900">{selectedUser.username}</span>
                </div>
                <div className="flex">
                  <span className="font-medium text-gray-600 w-32">Email:</span>
                  <span className="text-gray-900">{selectedUser.email}</span>
                </div>
                <div className="flex">
                  <span className="font-medium text-gray-600 w-32">Department:</span>
                  <span className="text-gray-900">
                    {departments.find(d => d.id === selectedUser.departmentId)?.name || 'N/A'}
                  </span>
                </div>
                {selectedUser.role === 'LECTURER' && (
                  <div className="flex">
                    <span className="font-medium text-gray-600 w-32">Status:</span>
                    <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                      selectedUser.isActive ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {selectedUser.isActive ? 'Active' : 'Pending Approval'}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Modules Section */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">
                {selectedUser.role === 'LECTURER' ? 'Teaching Modules' : 'Enrolled Modules'}
              </h4>
              {getUserModules(selectedUser).length === 0 ? (
                <div className="bg-gray-50 rounded-lg p-8 text-center">
                  <p className="text-gray-600">
                    {selectedUser.role === 'LECTURER' 
                      ? 'No modules assigned yet'
                      : 'Not enrolled in any modules yet'
                    }
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {getUserModules(selectedUser).map((module: any) => {
                    const isFull = module.enrolledCount >= module.limit;
                    const dept = departments.find(d => d.id === module.departmentId);
                    
                    return (
                      <div key={module.id} className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h5 className="font-semibold text-gray-900">{module.name}</h5>
                            <p className="text-sm text-gray-600">{module.code}</p>
                          </div>
                          {selectedUser.role === 'LECTURER' && (
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              isFull ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                            }`}>
                              {isFull ? 'Full' : 'Open'}
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p>Department: {dept?.name}</p>
                          {selectedUser.role === 'LECTURER' && (
                            <p>Enrolled: {module.enrolledCount}/{module.limit} students</p>
                          )}
                        </div>
                        {selectedUser.role === 'LECTURER' && (
                          <div className="mt-2">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full transition-all ${
                                  isFull ? 'bg-red-600' : 'bg-green-600'
                                }`}
                                style={{
                                  width: `${Math.min((module.enrolledCount / module.limit) * 100, 100)}%`
                                }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Approve Button for Pending Lecturers */}
            {selectedUser.role === 'LECTURER' && !selectedUser.isActive && (
              <div className="mt-6 pt-6 border-t">
                <button
                  onClick={() => {
                    approveLecturer(selectedUser.id);
                    setShowUserDetailModal(false);
                    setSelectedUser(null);
                  }}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  Approve Lecturer
                </button>
              </div>
            )}

            {/* Close Button */}
            <div className="mt-6">
              <button
                onClick={() => {
                  setShowUserDetailModal(false);
                  setSelectedUser(null);
                }}
                className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
