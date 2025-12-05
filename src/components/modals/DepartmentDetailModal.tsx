import { Department, User, Module } from '../../types';
import Modal from './Modal';

interface DepartmentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  department: Department;
  lecturers?: User[];
  students?: User[];
  modules?: Module[];
}

export default function DepartmentDetailModal({
  isOpen,
  onClose,
  department,
  lecturers = [],
  students = [],
  modules = []
}: DepartmentDetailModalProps) {
  const activeLecturers = lecturers.filter(l => l.isActive);
  const pendingLecturers = lecturers.filter(l => !l.isActive);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Department Details" maxWidth="2xl">
      <div className="space-y-6">
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-xl font-bold text-gray-900 mb-3">{department.name}</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Total Modules:</span>
              <p className="font-medium text-gray-900">{modules.length}</p>
            </div>
            <div>
              <span className="text-gray-600">Total Lecturers:</span>
              <p className="font-medium text-gray-900">{lecturers.length}</p>
            </div>
            <div>
              <span className="text-gray-600">Active Lecturers:</span>
              <p className="font-medium text-gray-900">{activeLecturers.length}</p>
            </div>
            <div>
              <span className="text-gray-600">Total Students:</span>
              <p className="font-medium text-gray-900">{students.length}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{modules.length}</div>
            <div className="text-sm text-blue-600">Modules</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{activeLecturers.length}</div>
            <div className="text-sm text-green-600">Active Lecturers</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{students.length}</div>
            <div className="text-sm text-purple-600">Students</div>
          </div>
        </div>

        {modules.length > 0 && (
          <div>
            <h5 className="font-semibold text-gray-900 mb-3">Recent Modules</h5>
            <div className="space-y-2">
              {modules.slice(0, 5).map((module) => {
                const lecturer = lecturers.find(l => l.id === module.lecturerId);
                const isFull = module.enrolledCount >= module.limit;
                
                return (
                  <div key={module.id} className="bg-white border border-gray-200 rounded-lg p-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <h6 className="font-medium text-gray-900">{module.name}</h6>
                        <p className="text-sm text-gray-600">
                          {module.code} • {lecturer ? `${lecturer.firstName} ${lecturer.lastName}` : 'No lecturer assigned'}
                        </p>
                      </div>
                      <div className="text-right text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          isFull ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                        }`}>
                          {module.enrolledCount}/{module.limit}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
              {modules.length > 5 && (
                <p className="text-sm text-gray-500 text-center">
                  ... and {modules.length - 5} more modules
                </p>
              )}
            </div>
          </div>
        )}


        {pendingLecturers.length > 0 && (
          <div>
            <h5 className="font-semibold text-gray-900 mb-3">
              Pending Lecturer Approvals ({pendingLecturers.length})
            </h5>
            <div className="space-y-2">
              {pendingLecturers.map((lecturer) => (
                <div key={lecturer.id} className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <h6 className="font-medium text-gray-900">
                        {lecturer.firstName} {lecturer.lastName}
                      </h6>
                      <p className="text-sm text-gray-600">{lecturer.email}</p>
                    </div>
                    <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-700">
                      Pending
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

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