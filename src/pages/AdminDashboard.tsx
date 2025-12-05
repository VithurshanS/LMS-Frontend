import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  DashboardLayout, 
  TabNavigation, 
  StudentView, 
  LecturerView, 
  ModuleView, 
  CreateDepartmentModal, 
  CreateModuleModal 
} from '../components';
import { Department, Module, User } from '../types';
import { getAllDepartments,getAllLecturers,getAllStudents,getDeptModuleDetails,getAllDepartmentLecturers,getAllDepartmentStudents, createModule as createModuleAPI, assignLecturerToModule, createDepartment as createDepartmentAPI } from '../api/api';

type TabType = 'departments' | 'lecturers' | 'students';

export default function AdminDashboard() {
  const { currentUser, approveLecturer } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('departments');
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

  
  // const [departments,setDepartments] = useState<Department[]>([])
  const navigate = useNavigate();



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
    
    console.log('Department Modules:', deptModules);
    console.log('Department Lecturers:', deptLecturers);
    console.log('Department Students:', deptStudents);
    
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

  // const departmentModules = selectedDepartmentId 
  //   ? getDepartmentModules(selectedDepartmentId)
  //   : [];

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

      // Refetch all departments to update the list
      await fetchAllData();

      // Reset form and close modal
      setNewDepartmentName('');
      setShowCreateDepartmentModal(false);
      alert('Department created successfully!');
    } catch (error) {
      console.error('Error creating department:', error);
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
      // Step 1: Create the module
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

      // Step 2: If lecturer is selected, assign them to the module
      if (newModuleData.lecturerId) {
        const assignSuccess = await assignLecturerToModule({
          moduleId: createdModule.id,
          lecturerId: newModuleData.lecturerId
        });

        if (!assignSuccess) {
          alert('Module created but failed to assign lecturer. You can assign them later.');
        }
      }

      // Step 3: Refetch department data to update the UI
      await fetchDepartmentData();

      // Reset form and close modal
      setNewModuleData({ code: '', name: '', lecturerId: '', limit: 30 });
      setShowCreateModuleModal(false);
      alert('Module created successfully!');
    } catch (error) {
      console.error('Error creating module:', error);
      alert('Failed to create module. Please try again.');
    } finally {
      setIsCreatingModule(false);
    }
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
                    title="Modules"
                    emptyMessage="No modules in this department yet"
                    onModuleUpdate={fetchDepartmentData}
                  />
                </div>

                <div className="mb-8">
                  <LecturerView
                    lecturers={departmentLecturers}
                    departments={departments}
                    title="Lecturers"
                    showDepartment={false}
                    emptyMessage="No lecturers in this department yet"
                    onLecturerUpdate={fetchDepartmentData}
                  />
                </div>

                <StudentView
                  students={departmentStudents}
                  departments={departments}
                  // modules={modules}
                  // enrollments={enrollments}
                  // title="Students in Department"
                  // showDepartment={false}
                  // showUsername={true}
                  // emptyMessage="No students in this department yet"
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
                    //const deptLecturers = getDepartmentLecturers(dept.id);
                    
                    return (
                      <button
                        key={dept.id}
                        onClick={() => setSelectedDepartmentId(dept.id)}
                        className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow text-left"
                      >
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">{dept.name}</h3>
                          {/* <div className="space-y-1 text-sm text-gray-600">
                            <p>{departmentLecturers.length} Lecturers</p>
                          </div> */}
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
            lecturers={allLecturers}
            departments={departments}
            title="Lecturers"
            showDepartment={true}
            emptyMessage="No lecturers registered yet"
            onLecturerUpdate={fetchAllData}
          />
        )}

        {activeTab === 'students' && (
          <StudentView
            students={allStudents}
            departments={departments}
            // modules={modules}
            // enrollments={enrollments}
            // title="Students"
            // showDepartment={true}
            // showUsername={true}
            // emptyMessage="No students registered yet"
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
