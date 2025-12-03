import { User, Department, Module } from '../../types';
import Modal from './Modal';

interface LecturerDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  lecturer: User;
  department?: Department;
  teachingModules?: Module[];
  onApproveLecturer?: (lecturerId: string) => void;
}

export default function LecturerDetailModal({
  isOpen,
  onClose,
  lecturer,
  department,
  teachingModules = [],
  onApproveLecturer
}: LecturerDetailModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Lecturer Details" maxWidth="2xl">
      <div className="space-y-6">

        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-3">Personal Informationn</h4>
          <div className="space-y-2 text-sm">
            <div className="flex">
              <span className="font-medium text-gray-600 w-32">Name:</span>
              <span className="text-gray-900">{lecturer.firstName} {lecturer.lastName}</span>
            </div>
            <div className="flex">
              <span className="font-medium text-gray-600 w-32">Username:</span>
              <span className="text-gray-900">{lecturer.username}</span>
            </div>
            <div className="flex">
              <span className="font-medium text-gray-600 w-32">Email:</span>
              <span className="text-gray-900">{lecturer.email}</span>
            </div>
            <div className="flex">
              <span className="font-medium text-gray-600 w-32">Department:</span>
              <span className="text-gray-900">{department?.name || 'N/A'}</span>
            </div>
            <div className="flex">
              <span className="font-medium text-gray-600 w-32">Status:</span>
              <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                lecturer.isActive ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
              }`}>
                {lecturer.isActive ? 'Active' : 'Pending Approval'}
              </span>
            </div>
          </div>
        </div>

        {/* Teaching Modules */}
        <div>
          <h4 className="font-semibold text-gray-900 mb-3">
            Teaching Modules ({teachingModules.length})
          </h4>
          {teachingModules.length === 0 ? (
            <div className="bg-gray-50 rounded-lg p-6 text-center">
              <p className="text-gray-600">No modules assigned yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {teachingModules.map((module) => {
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

        {/* Action Buttons */}
        <div className="space-y-3 pt-4 border-t">
          {/* Approve Button for Pending Lecturers */}
          {!lecturer.isActive && onApproveLecturer && (
            <button
              onClick={() => {
                onApproveLecturer(lecturer.id);
                onClose();
              }}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              Approve Lecturer
            </button>
          )}

          {/* Close Button */}
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