import { Module, User, Department } from '../types';
import Modal from './Modal';
import Badge from './Badge';

interface ModuleDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  module: Module;
  lecturer?: User;
  department?: Department;
  enrolledStudents?: User[];
}

export default function ModuleDetailModal({ 
  isOpen, 
  onClose, 
  module, 
  lecturer,
  department,
  enrolledStudents = []
}: ModuleDetailModalProps) {
  const isFull = module.enrolledCount >= module.limit;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Module Details" maxWidth="2xl">
      <div className="space-y-6">
        {/* Module Overview */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h4 className="text-xl font-bold text-gray-900">{module.name}</h4>
              <p className="text-sm text-gray-600">{module.code}</p>
            </div>
            <Badge variant={isFull ? 'error' : 'success'}>
              {isFull ? 'Full' : 'Open'}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Department:</span>
              <p className="font-medium text-gray-900">{department?.name || 'N/A'}</p>
            </div>
            <div>
              <span className="text-gray-600">Lecturer:</span>
              <p className="font-medium text-gray-900">
                {lecturer ? `${lecturer.firstName} ${lecturer.lastName}` : 'Not assigned'}
              </p>
            </div>
            <div>
              <span className="text-gray-600">Enrolled Students:</span>
              <p className="font-medium text-gray-900">{module.enrolledCount}</p>
            </div>
            <div>
              <span className="text-gray-600">Capacity:</span>
              <p className="font-medium text-gray-900">{module.enrolledCount}/{module.limit}</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>Enrollment Progress</span>
              <span>{Math.round((module.enrolledCount / module.limit) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all ${
                  isFull ? 'bg-red-600' : 'bg-green-600'
                }`}
                style={{
                  width: `${Math.min((module.enrolledCount / module.limit) * 100, 100)}%`
                }}
              />
            </div>
          </div>
        </div>

        {/* Enrolled Students List */}
        {enrolledStudents.length > 0 && (
          <div>
            <h5 className="font-semibold text-gray-900 mb-3">
              Enrolled Students ({enrolledStudents.length})
            </h5>
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Username</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {enrolledStudents.map(student => (
                    <tr key={student.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {student.firstName} {student.lastName}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {student.email}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {student.username}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {enrolledStudents.length === 0 && (
          <div className="bg-gray-50 rounded-lg p-6 text-center">
            <p className="text-gray-600">No students enrolled yet</p>
          </div>
        )}
      </div>
    </Modal>
  );
}
