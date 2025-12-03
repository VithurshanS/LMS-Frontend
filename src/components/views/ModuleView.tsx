import { useState } from 'react';
import { Module, User, Department, Enrollment } from '../../types';
import ModuleDetailModal from '../modals/ModuleDetailModal';

interface ModuleViewProps {
  modules: Module[];
  lecturers: User[];
  departments: Department[];
  students?: User[];
  enrollments?: Enrollment[];
  title: string;
  showLecturer?: boolean;
  showDepartment?: boolean;
  showEnrollment?: boolean;
  onModuleClick?: (module: Module) => void;
  emptyMessage?: string;
  className?: string;
  enableModal?: boolean;
  layout?: 'grid' | 'table';
}

export default function ModuleView({
  modules,
  lecturers,
  departments,
  students = [],
  enrollments = [],
  title,
  showLecturer = true,
  showDepartment = true,
  showEnrollment = true,
  onModuleClick,
  emptyMessage = "No modules found",
  className = "",
  enableModal = true,
  layout = 'grid'
}: ModuleViewProps) {
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [showModal, setShowModal] = useState(false);

  const handleModuleClick = (module: Module) => {
    if (onModuleClick) {
      onModuleClick(module);
    } else if (enableModal) {
      setSelectedModule(module);
      setShowModal(true);
    }
  };

  const getEnrolledStudents = (moduleId: string): User[] => {
    return students.filter(student => 
      enrollments.some(e => e.moduleId === moduleId && e.studentId === student.id)
    );
  };

  if (modules.length === 0) {
    return (
      <div className={className}>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">{title}</h2>
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <p className="text-gray-600">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  if (layout === 'grid') {
    return (
      <div className={className}>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">{title}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map(module => {
            const lecturer = lecturers.find(l => l.id === module.lecturerId);
            const department = departments.find(d => d.id === module.departmentId);
            const isFull = module.enrolledCount >= module.limit;
            const enrolledStudents = getEnrolledStudents(module.id);
            
            return (
              <div
                key={module.id}
                onClick={(onModuleClick || enableModal) ? () => handleModuleClick(module) : undefined}
                className={`bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow ${
                  (onModuleClick || enableModal) ? 'cursor-pointer' : ''
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{module.name}</h3>
                    <p className="text-sm text-gray-600">{module.code}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    isFull ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                  }`}>
                    {isFull ? 'Full' : 'Open'}
                  </span>
                </div>

                {showDepartment && (
                  <div className="mb-2">
                    <span className="text-sm text-gray-600">Department: </span>
                    <span className="text-sm font-medium text-gray-900">
                      {department?.name || 'N/A'}
                    </span>
                  </div>
                )}

                {showLecturer && (
                  <div className="mb-2">
                    <span className="text-sm text-gray-600">Lecturer: </span>
                    <span className="text-sm font-medium text-gray-900">
                      {lecturer ? `${lecturer.firstName} ${lecturer.lastName}` : 'Not assigned'}
                    </span>
                  </div>
                )}

                {showEnrollment && (
                  <div className="mb-3">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Enrollment</span>
                      <span>{module.enrolledCount}/{module.limit}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          isFull ? 'bg-red-600' : 'bg-blue-600'
                        }`}
                        style={{
                          width: `${Math.min((module.enrolledCount / module.limit) * 100, 100)}%`
                        }}
                      />
                    </div>
                  </div>
                )}

                <div className="text-xs text-gray-500">
                  Click to view details
                </div>
              </div>
            );
          })}
        </div>

        {/* Module count summary */}
        <div className="mt-4 text-sm text-gray-600">
          <p>Total modules: {modules.length}</p>
          {modules.filter(m => m.enrolledCount >= m.limit).length > 0 && (
            <p>Full modules: {modules.filter(m => m.enrolledCount >= m.limit).length}</p>
          )}
        </div>

        {/* Module Detail Modal */}
        {selectedModule && enableModal && (
          <ModuleDetailModal
            isOpen={showModal}
            onClose={() => {
              setShowModal(false);
              setSelectedModule(null);
            }}
            module={selectedModule}
            lecturer={lecturers.find(l => l.id === selectedModule.lecturerId)}
            department={departments.find(d => d.id === selectedModule.departmentId)}
            departments={departments}
            enrolledStudents={getEnrolledStudents(selectedModule.id)}
          />
        )}
      </div>
    );
  }

  // Table layout
  return (
    <div className={className}>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">{title}</h2>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Module</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
              {showDepartment && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
              )}
              {showLecturer && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lecturer</th>
              )}
              {showEnrollment && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Enrollment</th>
              )}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {modules.map(module => {
              const lecturer = lecturers.find(l => l.id === module.lecturerId);
              const department = departments.find(d => d.id === module.departmentId);
              const isFull = module.enrolledCount >= module.limit;
              
              return (
                <tr 
                  key={module.id} 
                  className={`hover:bg-gray-50 ${(onModuleClick || enableModal) ? 'cursor-pointer' : ''}`}
                  onClick={(onModuleClick || enableModal) ? () => handleModuleClick(module) : undefined}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {module.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {module.code}
                  </td>
                  {showDepartment && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {department?.name || 'N/A'}
                    </td>
                  )}
                  {showLecturer && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {lecturer ? `${lecturer.firstName} ${lecturer.lastName}` : 'Not assigned'}
                    </td>
                  )}
                  {showEnrollment && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {module.enrolledCount}/{module.limit}
                    </td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      isFull ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                    }`}>
                      {isFull ? 'Full' : 'Open'}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Module count summary */}
      <div className="mt-4 text-sm text-gray-600">
        <p>Total modules: {modules.length}</p>
        {modules.filter(m => m.enrolledCount >= m.limit).length > 0 && (
          <p>Full modules: {modules.filter(m => m.enrolledCount >= m.limit).length}</p>
        )}
      </div>

      {/* Module Detail Modal */}
      {selectedModule && enableModal && (
        <ModuleDetailModal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setSelectedModule(null);
          }}
          module={selectedModule}
          lecturer={lecturers.find(l => l.id === selectedModule.lecturerId)}
          department={departments.find(d => d.id === selectedModule.departmentId)}
          departments={departments}
          enrolledStudents={getEnrolledStudents(selectedModule.id)}
        />
      )}
    </div>
  );
}