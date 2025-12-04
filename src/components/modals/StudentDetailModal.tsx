import { User, Department, Module, Enrollment } from '../../types';
import Modal from './Modal';

interface StudentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: User;
  department?: Department;
  enrolledModules?: Module[];
  enrollments?: Enrollment[];
}

export default function StudentDetailModal({
  isOpen,
  onClose,
  student,
  department,
  enrolledModules = [],
  enrollments = []
}: StudentDetailModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Student Details" maxWidth="2xl">
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


        <div>
          <h4 className="font-semibold text-gray-900 mb-3">
            Enrolled Modules ({enrolledModules.length})
          </h4>
          {enrolledModules.length === 0 ? (
            <div className="bg-gray-50 rounded-lg p-6 text-center">
              <p className="text-gray-600">Not enrolled in any modules yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {enrolledModules.map((module) => {
                const enrollment = enrollments.find(e => e.moduleId === module.id && e.studentId === student.id);
                const isFull = module.enrolledCount >= module.limit;
                
                return (
                  <div key={module.id} className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h5 className="font-semibold text-gray-900">{module.name}</h5>
                        <p className="text-sm text-gray-600">{module.code}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        isFull ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                      }`}>
                        {isFull ? 'Full' : 'Open'}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>Enrolled: {module.enrolledCount}/{module.limit} students</p>
                      {/* {enrollment && (
                        <p>Enrolled on: {new Date(enrollment.enrolledAt).toLocaleDateString()}</p>
                      )} */}
                    </div>
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
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Close Button */}
        <div className="pt-4 border-t">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
}