import { useState } from 'react';
import { User, Department } from '../../types';
import StudentDetailModal from '../modals/StudentDetailModal';

interface StudentViewProps {
  students: User[];
  departments: Department[];
  onStudentUpdate?: () => void;
  currentUser?: User;
}

export default function StudentView({
  students,
  departments,
  onStudentUpdate,
  currentUser
}: StudentViewProps) {
  const [selectedStudent, setSelectedStudent] = useState<User | null>(null);
  const [showModal, setShowModal] = useState(false);

  const handleStudentClick = (e: React.MouseEvent, student: User) => {
    e.stopPropagation();
    setSelectedStudent(student);
    setShowModal(true);
  };
  if (students.length === 0) {
    return (
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Students</h2>
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <p className="text-gray-600">No students found</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Students</h2>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {students.map(student => {
              const dept = departments.find(d => d.id === student.departmentId);
              
              return (
                <tr 
                  key={student.id} 
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={(e) => handleStudentClick(e, student)}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {student.firstName} {student.lastName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {student.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {dept?.name || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      student.isActive ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {student.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      <div className="mt-4 text-sm text-gray-600">
        <p>Total students: {students.length}</p>
      </div>

      {selectedStudent && (
        <StudentDetailModal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setSelectedStudent(null);
          }}
          student={selectedStudent}
          department={departments.find(d => d.id === selectedStudent.departmentId)}
          onStudentUpdate={onStudentUpdate}
          currentUser={currentUser}
        />
      )}
    </div>
  );
}
