import { useState } from 'react';
import { User, Department } from '../../types';
import LecturerDetailModal from '../modals/LecturerDetailModal';

interface LecturerViewProps {
  lecturers: User[];
  departments: Department[];
  title: string;
  showDepartment?: boolean;
  onLecturerClick?: (lecturer: User) => void;
  emptyMessage?: string;
  className?: string;
  enableModal?: boolean;
  onLecturerUpdate?: () => void;
  currentUser?: User;
}

export default function LecturerView({
  lecturers,
  departments,
  title,
  showDepartment = true,
  onLecturerClick,
  emptyMessage = "No lecturers found",
  className = "",
  enableModal = true,
  onLecturerUpdate,
  currentUser
}: LecturerViewProps) {
  const [selectedLecturer, setSelectedLecturer] = useState<User | null>(null);
  const [showModal, setShowModal] = useState(false);

  const handleLecturerClick = (e: React.MouseEvent, lecturer: User) => {
    e.stopPropagation();
    if (onLecturerClick) {
      onLecturerClick(lecturer);
    } else if (enableModal) {
      setSelectedLecturer(lecturer);
      setShowModal(true);
    }
  };

  if (lecturers.length === 0) {
    return (
      <div className={className}>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">{title}</h2>
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <p className="text-gray-600">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">{title}</h2>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              {showDepartment && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
              )}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {lecturers.map(lecturer => {
              const dept = departments.find(d => d.id === lecturer.departmentId);
              
              return (
                <tr 
                  key={lecturer.id} 
                  className={`hover:bg-gray-50 ${(onLecturerClick || enableModal) ? 'cursor-pointer' : ''}`}
                  onClick={(onLecturerClick || enableModal) ? (e) => handleLecturerClick(e, lecturer) : undefined}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {lecturer.firstName} {lecturer.lastName}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {lecturer.email}
                  </td>
                  {showDepartment && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {dept?.name || 'N/A'}
                    </td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      lecturer.isActive ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {lecturer.isActive ? 'Active' : 'Pending'}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-4 text-sm text-gray-600">
        <p>Total lecturers: {lecturers.length}</p>
        {lecturers.filter(l => !l.isActive).length > 0 && (
          <p>Pending approval: {lecturers.filter(l => !l.isActive).length}</p>
        )}
      </div>

      {/* Lecturer Detail Modal - Fetches teaching modules on demand */}
      {selectedLecturer && enableModal && (
        <LecturerDetailModal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setSelectedLecturer(null);
          }}
          lecturer={selectedLecturer}
          department={departments.find(d => d.id === selectedLecturer.departmentId)}
          onLecturerUpdate={onLecturerUpdate}
          currentUser={currentUser}
        />
      )}
    </div>
  );
}
