import { useState } from 'react';
import { User, Department, Module, Enrollment } from '../../types';
import LecturerDetailModal from '../modals/LecturerDetailModal';

interface LecturerViewProps {
  lecturers: User[];
  departments: Department[];
  modules?: Module[];
  enrollments?: Enrollment[];
  title: string;
  showDepartment?: boolean;
  showStatus?: boolean;
  showActions?: boolean;
  onLecturerClick?: (lecturer: User) => void;
  onApproveLecturer?: (lecturerId: string) => void;
  emptyMessage?: string;
  className?: string;
  enableModal?: boolean;
}

export default function LecturerView({
  lecturers,
  departments,
  modules = [],
  enrollments = [],
  title,
  showDepartment = true,
  showStatus = true,
  showActions = true,
  onLecturerClick,
  onApproveLecturer,
  emptyMessage = "No lecturers found",
  className = "",
  enableModal = true
}: LecturerViewProps) {
  const [selectedLecturer, setSelectedLecturer] = useState<User | null>(null);
  const [showModal, setShowModal] = useState(false);

  const handleLecturerClick = (lecturer: User) => {
    if (onLecturerClick) {
      onLecturerClick(lecturer);
    } else if (enableModal) {
      setSelectedLecturer(lecturer);
      setShowModal(true);
    }
  };

  const getLecturerModules = (lecturerId: string): Module[] => {
    return modules.filter(m => m.lecturerId === lecturerId);
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
              {showStatus && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              )}
              {showActions && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {lecturers.map(lecturer => {
              const dept = departments.find(d => d.id === lecturer.departmentId);
              
              return (
                <tr 
                  key={lecturer.id} 
                  className={`hover:bg-gray-50 ${(onLecturerClick || enableModal) ? 'cursor-pointer' : ''}`}
                  onClick={(onLecturerClick || enableModal) ? () => handleLecturerClick(lecturer) : undefined}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {lecturer.firstName} {lecturer.lastName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {lecturer.email}
                  </td>
                  {showDepartment && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {dept?.name || 'N/A'}
                    </td>
                  )}
                  {showStatus && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        lecturer.isActive ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {lecturer.isActive ? 'Active' : 'Pending'}
                      </span>
                    </td>
                  )}
                  {showActions && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {!lecturer.isActive && onApproveLecturer && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onApproveLecturer(lecturer.id);
                          }}
                          className="text-green-600 hover:text-green-700 font-medium mr-4"
                        >
                          Approve
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLecturerClick(lecturer);
                        }}
                        className="text-blue-600 hover:text-blue-700 font-medium"
                      >
                        View Details
                      </button>
                    </td>
                  )}
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

 
      {selectedLecturer && enableModal && (
        <LecturerDetailModal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setSelectedLecturer(null);
          }}
          lecturer={selectedLecturer}
          department={departments.find(d => d.id === selectedLecturer.departmentId)}
          teachingModules={getLecturerModules(selectedLecturer.id)}
          onApproveLecturer={onApproveLecturer}
        />
      )}
    </div>
  );
}