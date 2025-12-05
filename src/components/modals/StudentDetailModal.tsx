import { useState, useEffect } from 'react';
import { User, Department, Module } from '../../types';
import Modal from './Modal';
import ModuleDetailModal from './ModuleDetailModal';
import { InfoCard } from '../ui';
import { getDepartmentById, getModulebyStudentId } from '../../api/api';

interface StudentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: User;
  department?: Department;
}

export default function StudentDetailModal({
  isOpen,
  onClose,
  student,
  department: propDepartment
}: StudentDetailModalProps) {
  const [loading, setLoading] = useState(false);
  const [showModules, setShowModules] = useState(false);
  const [enrolledModules, setEnrolledModules] = useState<Module[]>([]);
  const [department, setDepartment] = useState<Department | undefined>(propDepartment);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [showModuleModal, setShowModuleModal] = useState(false);

  useEffect(() => {
    if (isOpen && student) {
      fetchStudentDetails();
    }
  }, [isOpen, student.id]);

  const fetchStudentDetails = async () => {
    setLoading(true);
    try {
      const [modules, dept] = await Promise.all([
        getModulebyStudentId(student.id),
        student.departmentId && !propDepartment ? getDepartmentById(student.departmentId) : Promise.resolve(propDepartment)
      ]);
      
      setEnrolledModules(modules);
      setDepartment(dept || undefined);
    } catch (error) {
      console.error('Failed to fetch student details:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Student Details" maxWidth="2xl">
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
      <div className="space-y-6">
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-3">Personal Information</h4>
          <div className="space-y-2 text-sm">
            <div className="flex">
              <span className="font-medium text-gray-600 w-32">Name:</span>
              <span className="text-gray-900">{student.firstName} {student.lastName}</span>
            </div>
            <div className="flex">
              <span className="font-medium text-gray-600 w-32">Username:</span>
              <span className="text-gray-900">{student.username}</span>
            </div>
            <div className="flex">
              <span className="font-medium text-gray-600 w-32">Email:</span>
              <span className="text-gray-900">{student.email}</span>
            </div>
            <div className="flex">
              <span className="font-medium text-gray-600 w-32">Department:</span>
              <span className="text-gray-900">{department?.name || 'N/A'}</span>
            </div>
            <div className="flex">
              <span className="font-medium text-gray-600 w-32">Status:</span>
              <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                student.isActive ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
              }`}>
                {student.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        </div>


        <InfoCard
          title={`Enrolled Modules (${enrolledModules.length})`}
          action={{
            label: showModules ? 'Hide Modules' : 'Show Modules',
            onClick: () => setShowModules(!showModules)
          }}
        >
          {showModules && enrolledModules.length === 0 && (
            <p className="text-sm text-gray-500 py-2">Not enrolled in any modules yet</p>
          )}

          {showModules && enrolledModules.length > 0 && (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {enrolledModules.map((module) => {
                const isFull = module.enrolledCount >= module.limit;
                const percentFilled = (module.enrolledCount / module.limit) * 100;
                
                return (
                  <button
                    key={module.id}
                    onClick={() => {
                      setSelectedModule(module);
                      setShowModuleModal(true);
                    }}
                    className="w-full bg-white border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition-colors cursor-pointer text-left"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h5 className="font-semibold text-gray-900">{module.name}</h5>
                        <p className="text-xs text-gray-600">{module.code}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        isFull ? 'bg-red-100 text-red-700' : 
                        percentFilled >= 80 ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {isFull ? 'Full' : percentFilled >= 80 ? 'Almost Full' : 'Open'}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <p>Enrolled: {module.enrolledCount}/{module.limit} students</p>
                    </div>
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            isFull ? 'bg-red-600' : 
                            percentFilled >= 80 ? 'bg-yellow-600' :
                            'bg-green-600'
                          }`}
                          style={{
                            width: `${Math.min(percentFilled, 100)}%`
                          }}
                        />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </InfoCard>

        <div className="pt-4 border-t">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
      )}

      {selectedModule && (
        <ModuleDetailModal
          isOpen={showModuleModal}
          onClose={() => {
            setShowModuleModal(false);
            setSelectedModule(null);
          }}
          module={selectedModule}
          onModuleUpdate={fetchStudentDetails}
        />
      )}
    </Modal>
  );
}