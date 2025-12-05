import { useState, useEffect } from 'react';
import { Module, User, Department } from '../../types';
import Modal from './Modal';
import StudentDetailModal from './StudentDetailModal';
import LecturerDetailModal from './LecturerDetailModal';
import { InfoCard, UserAvatar, UserListItem } from '../ui';
import { getLecturerById, getDepartmentById, getEnrolledStudentsByModuleId, getAllDepartmentLecturers, assignLecturerToModule } from '../../api/api';

interface ModuleDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  module: Module;
  onModuleUpdate?: () => void;
}

export default function ModuleDetailModal({ 
  isOpen, 
  onClose, 
  module,
  onModuleUpdate
}: ModuleDetailModalProps) {
  const [loading, setLoading] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [showLecturerSelect, setShowLecturerSelect] = useState(false);
  const [showEnrolledStudents, setShowEnrolledStudents] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<User | null>(null);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [selectedLecturer, setSelectedLecturer] = useState<User | null>(null);
  const [showLecturerModal, setShowLecturerModal] = useState(false);
  const [moduleDetails, setModuleDetails] = useState<{
    lecturer?: User | null;
    department?: Department | null;
    enrolledStudents?: User[];
    departmentLecturers?: User[];
  }>({});

  useEffect(() => {
    if (isOpen && module) {
      fetchModuleDetails();
    }
  }, [isOpen, module.id]);

  const fetchModuleDetails = async () => {
    setLoading(true);
    try {
      const [lecturer, department, enrolledStudents, departmentLecturers] = await Promise.all([
        module.lecturerId ? getLecturerById(module.lecturerId) : Promise.resolve(null),
        getDepartmentById(module.departmentId),
        getEnrolledStudentsByModuleId(module.id),
        getAllDepartmentLecturers(module.departmentId)
      ]);
      
      setModuleDetails({
        lecturer,
        department,
        enrolledStudents,
        departmentLecturers
      });
    } catch (error) {
      console.error('Failed to fetch module details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignLecturer = async (lecturerId: string) => {
    setAssigning(true);
    try {
      const success = await assignLecturerToModule(module.id, lecturerId);
      if (success) {
        setShowLecturerSelect(false);
        await fetchModuleDetails();
        if (onModuleUpdate) {
          onModuleUpdate();
        }
      } else {
        alert('Failed to assign lecturer. Please try again.');
      }
    } catch (error) {
      console.error('Failed to assign lecturer:', error);
      alert('Failed to assign lecturer. Please try again.');
    } finally {
      setAssigning(false);
    }
  };

  const isFull = module.enrolledCount >= module.limit;
  const percentFilled = (module.enrolledCount / module.limit) * 100;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Module Details" maxWidth="2xl">
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="text-2xl font-bold text-gray-900">{module.name}</h4>
                <p className="text-sm text-gray-600 mt-1">{module.code}</p>
              </div>
              <span className={`px-3 py-1 text-sm rounded-full ${
                isFull ? 'bg-red-100 text-red-700' : 
                percentFilled >= 80 ? 'bg-yellow-100 text-yellow-700' :
                'bg-green-100 text-green-700'
              }`}>
                {isFull ? 'Full' : percentFilled >= 80 ? 'Almost Full' : 'Open'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-600 mb-1">Enrolled Students</p>
                <p className="text-2xl font-bold text-gray-900">{module.enrolledCount}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Student Limit</p>
                <p className="text-2xl font-bold text-gray-900">{module.limit}</p>
              </div>
            </div>

            <div className="mt-4">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Enrollment Progress</span>
                <span>{Math.round(percentFilled)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all ${
                    isFull ? 'bg-red-600' : 
                    percentFilled >= 80 ? 'bg-yellow-600' :
                    'bg-blue-600'
                  }`}
                  style={{
                    width: `${Math.min(percentFilled, 100)}%`
                  }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {module.limit - module.enrolledCount} spots remaining
              </p>
            </div>
          </div>


          <InfoCard
            title="Lecturer"
            action={{
              label: moduleDetails.lecturer ? 'Reassign' : 'Assign Lecturer',
              onClick: () => setShowLecturerSelect(!showLecturerSelect)
            }}
          >
            {showLecturerSelect ? (
              <div className="space-y-2">
                {assigning ? (
                  <div className="flex justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  </div>
                ) : (
                  <>
                    {moduleDetails.departmentLecturers && moduleDetails.departmentLecturers.length > 0 ? (
                      <div className="max-h-48 overflow-y-auto space-y-2">
                        {moduleDetails.departmentLecturers.map((lec) => (
                          <button
                            key={lec.id}
                            onClick={() => handleAssignLecturer(lec.id)}
                            disabled={moduleDetails.lecturer?.id === lec.id}
                            className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                              moduleDetails.lecturer?.id === lec.id
                                ? 'bg-blue-50 border-blue-300 cursor-not-allowed'
                                : 'hover:bg-gray-50 border-gray-200 cursor-pointer'
                            }`}
                          >
                            <UserAvatar firstName={lec.firstName} lastName={lec.lastName} size="sm" color="blue" />
                            <div className="flex-1 text-left">
                              <p className="text-sm font-medium text-gray-900">
                                {lec.firstName} {lec.lastName}
                              </p>
                              <p className="text-xs text-gray-600">{lec.email}</p>
                            </div>
                            {moduleDetails.lecturer?.id === lec.id && (
                              <span className="text-xs text-blue-600 font-medium">Current</span>
                            )}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 py-2">No lecturers available in this department</p>
                    )}
                    <button
                      onClick={() => setShowLecturerSelect(false)}
                      className="w-full text-sm text-gray-600 hover:text-gray-700 py-2"
                    >
                      Cancel
                    </button>
                  </>
                )}
              </div>
            ) : (
              <>
                {moduleDetails.lecturer ? (
                  <button
                    onClick={() => {
                      setSelectedLecturer(moduleDetails.lecturer!);
                      setShowLecturerModal(true);
                    }}
                    className="flex items-center gap-3 hover:bg-gray-50 p-2 rounded transition-colors cursor-pointer w-full text-left"
                  >
                    <UserAvatar firstName={moduleDetails.lecturer.firstName} lastName={moduleDetails.lecturer.lastName} color="blue" />
                    <div>
                      <p className="font-medium text-gray-900">
                        {moduleDetails.lecturer.firstName} {moduleDetails.lecturer.lastName}
                      </p>
                      <p className="text-sm text-gray-600">{moduleDetails.lecturer.email}</p>
                    </div>
                  </button>
                ) : (
                  <p className="text-sm text-gray-500">No lecturer assigned yet</p>
                )}
              </>
            )}
          </InfoCard>


          {moduleDetails.department && (
            <InfoCard title="Department">
              <p className="text-gray-700">{moduleDetails.department.name}</p>
            </InfoCard>
          )}

 
          <InfoCard
            title={`Enrolled Students (${moduleDetails.enrolledStudents?.length || 0})`}
            action={{
              label: showEnrolledStudents ? 'Hide Students' : 'Show Students',
              onClick: () => setShowEnrolledStudents(!showEnrolledStudents)
            }}
          >
            {showEnrolledStudents && moduleDetails.enrolledStudents && moduleDetails.enrolledStudents.length > 0 && (
              <div className="max-h-60 overflow-y-auto space-y-2">
                {moduleDetails.enrolledStudents.map((student) => (
                  <UserListItem
                    key={student.id}
                    user={student}
                    onClick={() => {
                      setSelectedStudent(student);
                      setShowStudentModal(true);
                    }}
                    avatarColor="green"
                  />
                ))}
              </div>
            )}
            
            {showEnrolledStudents && (!moduleDetails.enrolledStudents || moduleDetails.enrolledStudents.length === 0) && (
              <p className="text-sm text-gray-500 py-2">No students enrolled yet</p>
            )}
          </InfoCard>

          <div className="text-sm text-gray-500 text-center pt-4 border-t">
            Click outside or press ESC to close
          </div>
        </div>
      )}


      {selectedStudent && (
        <StudentDetailModal
          isOpen={showStudentModal}
          onClose={() => {
            setShowStudentModal(false);
            setSelectedStudent(null);
          }}
          student={selectedStudent}
          department={moduleDetails.department || undefined}
        />
      )}

      {selectedLecturer && (
        <LecturerDetailModal
          isOpen={showLecturerModal}
          onClose={() => {
            setShowLecturerModal(false);
            setSelectedLecturer(null);
          }}
          lecturer={selectedLecturer}
          department={moduleDetails.department || undefined}
        />
      )}
    </Modal>
  );
}
