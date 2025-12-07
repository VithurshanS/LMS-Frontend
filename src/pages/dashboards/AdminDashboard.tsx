import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  DashboardLayout, 
  StudentView, 
  LecturerView, 
  ModuleView, 
  CreateDepartmentModal, 
  CreateModuleModal 
} from '../../components';
import { Department, Module, User } from '../../types';
import { getAllDepartments,getAllLecturers,getAllStudents,getDeptModuleDetails,getAllDepartmentLecturers,getAllDepartmentStudents, createModule as createModuleAPI, assignLecturerToModule, createDepartment as createDepartmentAPI } from '../../api/services';

export default function AdminDashboard() {
  const { currentUser } = useAuth();
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string | null>(null);
  const [showCreateDepartmentModal, setShowCreateDepartmentModal] = useState(false);
  const [showCreateModuleModal, setShowCreateModuleModal] = useState(false);
  const [newDepartmentName, setNewDepartmentName] = useState('');
  const [allLecturers, setAllLecturers] = useState<User[]>([]);
  const [allStudents, setAllStudents] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [departmentModules, setDepartmentModules] = useState<Module[]>([]);
  const [departmentLecturers, setDepartmentLecturers] = useState<User[]>([]);
  const [departmentStudents, setDepartmentStudents] = useState<User[]>([]);
  const [newModuleData, setNewModuleData] = useState({
    code: '',
    name: '',
    lecturerId: '',
    limit: 30
  });
  const [isCreatingModule, setIsCreatingModule] = useState(false);
  const [isCreatingDepartment, setIsCreatingDepartment] = useState(false);
  
  const [expandedSections, setExpandedSections] = useState({
    departments: true,
    lecturers: false,
    students: false
  });



  useEffect(() => {
    fetchAllData();
  }, [currentUser]);

  const fetchAllData = async () => {
    if(currentUser != null && currentUser.role === 'ADMIN'){
      const [depts, lects, studs] = await Promise.all([
        getAllDepartments(),
        getAllLecturers(),
        getAllStudents()
      ]);
      
      setDepartments(depts);
      setAllLecturers(lects);
      setAllStudents(studs);
    }
  };
  
  const fetchDepartmentData = async () => {
    if (!selectedDepartmentId) return;
    
    const [deptModules, deptLecturers, deptStudents] = await Promise.all([
      getDeptModuleDetails(selectedDepartmentId),
      getAllDepartmentLecturers(selectedDepartmentId),
      getAllDepartmentStudents(selectedDepartmentId)
    ]);
    
    setDepartmentModules(deptModules);
    setDepartmentLecturers(deptLecturers);
    setDepartmentStudents(deptStudents);
  };
  
  useEffect(() => {
    fetchDepartmentData();
  }, [selectedDepartmentId]);


  const selectedDepartment = selectedDepartmentId 
    ? departments.find(d => d.id === selectedDepartmentId)
    : null;

  const handleCreateDepartment = async () => {
    if (!newDepartmentName.trim()) {
      alert('Department name is required');
      return;
    }

    setIsCreatingDepartment(true);
    try {
      const createdDepartment = await createDepartmentAPI(newDepartmentName.trim());
      
      if (!createdDepartment) {
        alert('Failed to create department. Please try again.');
        setIsCreatingDepartment(false);
        return;
      }

      await fetchAllData();

      setNewDepartmentName('');
      setShowCreateDepartmentModal(false);
      alert('Department created successfully!');
    } catch (error) {
      alert('Failed to create department. Please try again.');
    } finally {
      setIsCreatingDepartment(false);
    }
  };

  const handleCreateModule = async () => {
    if (!selectedDepartmentId || !currentUser) return;
    
    if (!newModuleData.code.trim() || !newModuleData.name.trim()) {
      alert('Module code and name are required');
      return;
    }

    setIsCreatingModule(true);
    try {
      const createdModule = await createModuleAPI({
        code: newModuleData.code.trim(),
        name: newModuleData.name.trim(),
        departmentId: selectedDepartmentId,
        limit: newModuleData.limit,
        adminId: currentUser.id
      });

      if (!createdModule) {
        alert('Failed to create module. Please try again.');
        setIsCreatingModule(false);
        return;
      }

      if (newModuleData.lecturerId) {
        const assignSuccess = await assignLecturerToModule({
          moduleId: createdModule.id,
          lecturerId: newModuleData.lecturerId
        });

        if (!assignSuccess) {
          alert('Module created but failed to assign lecturer. You can assign them later.');
        }
      }

      await fetchDepartmentData();

      setNewModuleData({ code: '', name: '', lecturerId: '', limit: 30 });
      setShowCreateModuleModal(false);
      alert('Module created successfully!');
    } catch (error) {
      alert('Failed to create module. Please try again.');
    } finally {
      setIsCreatingModule(false);
    }
  };

  const toggleSection = (section: 'departments' | 'lecturers' | 'students') => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  return (
    <DashboardLayout title="Admin Dashboard">
      <div className="space-y-6">
        {selectedDepartment ? (
          <div>
            <button
              onClick={() => setSelectedDepartmentId(null)}
              className="mb-6 flex items-center text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              ← Back to Departments
            </button>
            
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">{selectedDepartment.name}</h2>
              <button
                onClick={() => setShowCreateModuleModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm hover:shadow"
              >
                + Add Module
              </button>
            </div>

            <div className="mb-6">
              <div 
                onClick={() => toggleSection('departments')}
                className="bg-white rounded-lg shadow-sm border border-gray-200 cursor-pointer hover:shadow-md transition-all"
              >
                <div className="px-6 py-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Modules</h3>
                    <p className="text-sm text-gray-600">{departmentModules.length} modules in this department</p>
                  </div>
                  <span className={`text-gray-400 transition-transform duration-200 ${expandedSections.departments ? 'rotate-180' : ''}`}>
                    ▼
                  </span>
                </div>
                
                {expandedSections.departments && (
                  <div className="px-6 pb-6 border-t border-gray-100">
                    <div className="mt-4">
                      <ModuleView
                        modules={departmentModules}
                        title=""
                        emptyMessage="No modules in this department yet"
                        onModuleUpdate={fetchDepartmentData}
                        currentUser={currentUser || undefined}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="mb-6">
              <div 
                onClick={() => toggleSection('lecturers')}
                className="bg-white rounded-lg shadow-sm border border-gray-200 cursor-pointer hover:shadow-md transition-all"
              >
                <div className="px-6 py-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Lecturers</h3>
                    <p className="text-sm text-gray-600">{departmentLecturers.length} lecturers in this department</p>
                  </div>
                  <span className={`text-gray-400 transition-transform duration-200 ${expandedSections.lecturers ? 'rotate-180' : ''}`}>
                    ▼
                  </span>
                </div>
                
                {expandedSections.lecturers && (
                  <div className="px-6 pb-6 border-t border-gray-100">
                    <div className="mt-4">
                      <LecturerView
                        lecturers={departmentLecturers}
                        departments={departments}
                        title=""
                        showDepartment={false}
                        emptyMessage="No lecturers in this department yet"
                        onLecturerUpdate={fetchDepartmentData}
                        currentUser={currentUser || undefined}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="mb-6">
              <div 
                onClick={() => toggleSection('students')}
                className="bg-white rounded-lg shadow-sm border border-gray-200 cursor-pointer hover:shadow-md transition-all"
              >
                <div className="px-6 py-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Students</h3>
                    <p className="text-sm text-gray-600">{departmentStudents.length} students in this department</p>
                  </div>
                  <span className={`text-gray-400 transition-transform duration-200 ${expandedSections.students ? 'rotate-180' : ''}`}>
                    ▼
                  </span>
                </div>
                
                {expandedSections.students && (
                  <div className="px-6 pb-6 border-t border-gray-100">
                    <div className="mt-4">
                      <StudentView
                        students={departmentStudents}
                        departments={departments}
                        onStudentUpdate={fetchDepartmentData}
                        currentUser={currentUser || undefined}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <div 
                onClick={() => toggleSection('departments')}
                className="bg-white rounded-lg shadow-sm border border-gray-200 cursor-pointer hover:shadow-md transition-all"
              >
                <div className="px-6 py-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Departments</h3>
                    <p className="text-sm text-gray-600">{departments.length} departments</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowCreateDepartmentModal(true);
                      }}
                      className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      + Add
                    </button>
                    <span className={`text-gray-400 transition-transform duration-200 ${expandedSections.departments ? 'rotate-180' : ''}`}>
                      ▼
                    </span>
                  </div>
                </div>
                
                {expandedSections.departments && (
                  <div className="px-6 pb-6 border-t border-gray-100">
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {departments.map(dept => (
                        <button
                          key={dept.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedDepartmentId(dept.id);
                          }}
                          className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-5 hover:shadow-md hover:border-blue-300 transition-all text-left group"
                        >
                          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
                            {dept.name}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">Click to view details</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="mb-6">
              <div 
                onClick={() => toggleSection('lecturers')}
                className="bg-white rounded-lg shadow-sm border border-gray-200 cursor-pointer hover:shadow-md transition-all"
              >
                <div className="px-6 py-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">All Lecturers</h3>
                    <p className="text-sm text-gray-600">{allLecturers.length} lecturers • {allLecturers.filter(l => !l.isActive).length} pending approval</p>
                  </div>
                  <span className={`text-gray-400 transition-transform duration-200 ${expandedSections.lecturers ? 'rotate-180' : ''}`}>
                    ▼
                  </span>
                </div>
                
                {expandedSections.lecturers && (
                  <div className="px-6 pb-6 border-t border-gray-100">
                    <div className="mt-4">
                      <LecturerView
                        lecturers={allLecturers}
                        departments={departments}
                        title=""
                        showDepartment={true}
                        emptyMessage="No lecturers registered yet"
                        onLecturerUpdate={fetchAllData}
                        currentUser={currentUser || undefined}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="mb-6">
              <div 
                onClick={() => toggleSection('students')}
                className="bg-white rounded-lg shadow-sm border border-gray-200 cursor-pointer hover:shadow-md transition-all"
              >
                <div className="px-6 py-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">All Students</h3>
                    <p className="text-sm text-gray-600">{allStudents.length} students</p>
                  </div>
                  <span className={`text-gray-400 transition-transform duration-200 ${expandedSections.students ? 'rotate-180' : ''}`}>
                    ▼
                  </span>
                </div>
                
                {expandedSections.students && (
                  <div className="px-6 pb-6 border-t border-gray-100">
                    <div className="mt-4">
                      <StudentView
                        students={allStudents}
                        departments={departments}
                        onStudentUpdate={fetchAllData}
                        currentUser={currentUser || undefined}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
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
        isCreating={isCreatingDepartment}
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
        isCreating={isCreatingModule}
      />
    </DashboardLayout>
  );
}
