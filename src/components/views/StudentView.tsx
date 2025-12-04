import { useState } from 'react';
import { User, Department, Module, Enrollment } from '../../types';
import StudentDetailModal from '../modals/StudentDetailModal';

interface StudentViewProps {
  students: User[];
  departments: Department[];
  modules?: Module[];
  enrollments?: Enrollment[];
  title: string;
  showDepartment?: boolean;
  showUsername?: boolean;
  showActions?: boolean;
  onStudentClick?: (student: User) => void;
  emptyMessage?: string;
  className?: string;
  enableModal?: boolean;
}

export default function StudentView({
  students,
  departments,
  modules = [],
  enrollments = [],
  title,
  showDepartment = true,
  showUsername = true,
  showActions = false,
  onStudentClick,
  emptyMessage = "No students found",
  className = "",
  enableModal = true
}: StudentViewProps) {
  const [selectedStudent, setSelectedStudent] = useState<User | null>(null);
  const [showModal, setShowModal] = useState(false);

  const handleStudentClick = (student: User) => {
    if (onStudentClick) {
      onStudentClick(student);
    } else if (enableModal) {
      setSelectedStudent(student);
      setShowModal(true);
    }
  };

  const getStudentModules = (studentId: string): Module[] => {
    const studentEnrollments = enrollments.filter(e => e.studentId === studentId);
    return studentEnrollments
      .map(enrollment => modules.find(m => m.id === enrollment.moduleId))
      .filter(Boolean) as Module[];
  };
  if (students.length === 0) {
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
              {showUsername && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Username</th>
              )}
              {showActions && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {students.map(student => {
              const dept = departments.find(d => d.id === student.departmentId);
              
              return (
                <tr 
                  key={student.id} 
                  className={`hover:bg-gray-50 ${(onStudentClick || enableModal) ? 'cursor-pointer' : ''}`}
                  onClick={(onStudentClick || enableModal) ? () => handleStudentClick(student) : undefined}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {student.firstName} {student.lastName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {student.email}
                  </td>
                  {showDepartment && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {dept?.name || 'N/A'}
                    </td>
                  )}
                  {showUsername && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {student.username}
                    </td>
                  )}
                  {showActions && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStudentClick(student);
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
        <p>Total students: {students.length}</p>
      </div>


      {selectedStudent && enableModal && (
        <StudentDetailModal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setSelectedStudent(null);
          }}
          student={selectedStudent}
          department={departments.find(d => d.id === selectedStudent.departmentId)}
          enrolledModules={getStudentModules(selectedStudent.id)}
          enrollments={enrollments}
        />
      )}
    </div>
  );
}
