import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  DashboardLayout, 
  TabNavigation, 
  ModuleCard, 
  EmptyState, 
  ModuleDetailModal, 
  StudentView, 
  LecturerView, 
  ModuleView, 
  CreateDepartmentModal, 
  CreateModuleModal 
} from '../components';
import { Module } from '../types';

type TabType = 'departments' | 'lecturers' | 'students';

export default function AdminDashboard() {
  const { currentUser, logout, departments, users, approveLecturer, getDepartmentModules, getDepartmentLecturers, createDepartment, createModule, modules, enrollments } = useAuth();
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

  const tabs = [
    { key: 'departments', label: 'Departments' },
    { key: 'lecturers', label: 'Lecturers' },
    { key: 'students', label: 'Students' }
  ];

  const handleTabChange = (tab: string) => {
    setActiveTab(tab as TabType);
    setSelectedDepartmentId(null);
  };

  return (
    <DashboardLayout title="Admin Dashboard">
      <TabNavigation activeTab={activeTab} onTabChange={handleTabChange} tabs={tabs} />
      
      <div className="mt-8">
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

                <div className="mb-8">
                  <ModuleView
                    modules={departmentModules}
                    lecturers={users}
                    departments={departments}
                    students={students}
                    enrollments={enrollments}
                    title="Modules"
                    showDepartment={false}
                    showLecturer={true}
                    showEnrollment={true}
                    layout="grid"
                    emptyMessage="No modules in this department yet"
                  />
                </div>

                <div className="mb-8">
                  <LecturerView
                    lecturers={departmentLecturers}
                    departments={departments}
                    modules={modules}
                    enrollments={enrollments}
                    title="Lecturers"
                    showDepartment={false}
                    showStatus={true}
                    showActions={true}
                    onApproveLecturer={approveLecturer}
                    emptyMessage="No lecturers in this department yet"
                  />
                </div>

                <StudentView
                  students={students.filter(s => s.departmentId === selectedDepartmentId)}
                  departments={departments}
                  modules={modules}
                  enrollments={enrollments}
                  title="Students in Department"
                  showDepartment={false}
                  showUsername={true}
                  emptyMessage="No students in this department yet"
                />
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

        {activeTab === 'lecturers' && (
          <LecturerView
            lecturers={lecturers}
            departments={departments}
            modules={modules}
            enrollments={enrollments}
            title="Lecturers"
            showDepartment={true}
            showStatus={true}
            showActions={true}
            onApproveLecturer={approveLecturer}
            emptyMessage="No lecturers registered yet"
          />
        )}

        {activeTab === 'students' && (
          <StudentView
            students={students}
            departments={departments}
            modules={modules}
            enrollments={enrollments}
            title="Students"
            showDepartment={true}
            showUsername={true}
            emptyMessage="No students registered yet"
          />
        )}
      </div>


      <CreateDepartmentModal
        isOpen={showCreateDepartmentModal}
        onClose={() => {
          setShowCreateDepartmentModal(false);
          setNewDepartmentName('');
        }}
        departmentName={newDepartmentName}
        onDepartmentNameChange={setNewDepartmentName}
        onSubmit={handleCreateDepartment}
      />


      <CreateModuleModal
        isOpen={showCreateModuleModal && !!selectedDepartment}
        onClose={() => {
          setShowCreateModuleModal(false);
          setNewModuleData({ code: '', name: '', lecturerId: '', limit: 30 });
        }}
        departmentName={selectedDepartment?.name}
        moduleData={newModuleData}
        onModuleDataChange={setNewModuleData}
        onSubmit={handleCreateModule}
        lecturers={departmentLecturers}
      />
    </DashboardLayout>
  );
}
