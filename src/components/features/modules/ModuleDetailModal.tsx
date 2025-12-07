import { useState, useEffect } from 'react';
import { Module, User, Department } from '../../../types';
import Modal from '../../common/Modal';
import StudentDetailModal from '../users/StudentDetailModal';
import LecturerDetailModal from '../users/LecturerDetailModal';
import { InfoCard, UserAvatar, UserListItem } from '../../common';
import { getLecturerById, getDepartmentById, getEnrolledStudentsByModuleId, getAllDepartmentLecturers, assignLecturerToModule, unerrollFromModule } from '../../../api/services';

interface ModuleDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  module: Module;
  onModuleUpdate?: () => void;
  showStudentsList?: boolean;
  allowLecturerClick?: boolean;
  allowLecturerAssignment?: boolean;
  currentUser?: User;
  onJoinMeeting?: (module: Module) => void;
}

export default function ModuleDetailModal({ 
  isOpen, 
  onClose, 
  module,
  onModuleUpdate,
  showStudentsList = true,
  allowLecturerClick = true,
  allowLecturerAssignment = true,
  currentUser,
  onJoinMeeting
}: ModuleDetailModalProps) {
  const [loading, setLoading] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [unenrolling, setUnenrolling] = useState<string | null>(null);
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
  const [updatedModule, setUpdatedModule] = useState<Module>(module);
  
  const isAdmin = currentUser?.role === 'ADMIN';

  useEffect(() => {
    if (isOpen && module) {
      setUpdatedModule(module);
      fetchModuleDetails();
    }
  }, [isOpen, module.id]);

  useEffect(() => {
    if (updatedModule.lecturerId !== module.lecturerId) {
      fetchModuleDetails();
    }
  }, [updatedModule.lecturerId]);

  const fetchModuleDetails = async () => {
    setLoading(true);
    try {
      const fetchPromises: Promise<any>[] = [
        updatedModule.lecturerId ? getLecturerById(updatedModule.lecturerId) : Promise.resolve(null),
        getDepartmentById(updatedModule.departmentId)
      ];

      if (showStudentsList) {
        fetchPromises.push(getEnrolledStudentsByModuleId(updatedModule.id));
      }
      if (allowLecturerAssignment) {
        fetchPromises.push(getAllDepartmentLecturers(updatedModule.departmentId));
      }

      const results = await Promise.all(fetchPromises);
      
      setModuleDetails({
        lecturer: results[0],
        department: results[1],
        enrolledStudents: showStudentsList ? results[2] : [],
        departmentLecturers: allowLecturerAssignment ? results[showStudentsList ? 3 : 2] : []
      });
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const handleAssignLecturer = async (lecturerId: string) => {
    setAssigning(true);
    try {
      const success = await assignLecturerToModule({moduleId: updatedModule.id, lecturerId});
      if (success) {
        setUpdatedModule(prev => ({ ...prev, lecturerId }));
        setShowLecturerSelect(false);
        await fetchModuleDetails();
        if (onModuleUpdate) {
          onModuleUpdate();
        }
      } else {
        alert('Failed to assign lecturer. Please try again.');
      }
    } catch (error) {
      alert('Failed to assign lecturer. Please try again.');
    } finally {
      setAssigning(false);
    }
  };

  const handleUnenroll = async (studentId: string) => {
    if (!confirm('Are you sure you want to unenroll this student from the module?')) {
      return;
    }

    setUnenrolling(studentId);
    try {
      const success = await unerrollFromModule({ studentId, moduleId: updatedModule.id });
      if (success) {
        await fetchModuleDetails();
        setUpdatedModule(prev => ({
          ...prev,
          enrolledCount: Math.max(0, prev.enrolledCount - 1)
        }));
        if (onModuleUpdate) {
          onModuleUpdate();
        }
      } else {
        alert('Failed to unenroll student. Please try again.');
      }
    } catch (error) {
      alert('Failed to unenroll student. Please try again.');
    } finally {
      setUnenrolling(null);
    }
  };

  const isFull = updatedModule.enrolledCount >= updatedModule.limit;
  const percentFilled = (updatedModule.enrolledCount / updatedModule.limit) * 100;
  const hasLecturer = updatedModule.lecturerId && moduleDetails.lecturer;
  const isNotReady = !hasLecturer;

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
                <h4 className="text-2xl font-bold text-gray-900">{updatedModule.name}</h4>
                <p className="text-sm text-gray-600 mt-1">{updatedModule.code}</p>
              </div>
              <span className={`px-3 py-1 text-sm rounded-full ${
                isNotReady ? 'bg-gray-100 text-gray-700' :
                isFull ? 'bg-red-100 text-red-700' : 
                percentFilled >= 80 ? 'bg-yellow-100 text-yellow-700' :
                'bg-green-100 text-green-700'
              }`}>
                {isNotReady ? 'Not Available' : isFull ? 'Full' : percentFilled >= 80 ? 'Almost Full' : 'Open'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-600 mb-1">Enrolled Students</p>
                <p className="text-2xl font-bold text-gray-900">{updatedModule.enrolledCount}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Student Limit</p>
                <p className="text-2xl font-bold text-gray-900">{updatedModule.limit}</p>
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
                {updatedModule.limit - updatedModule.enrolledCount} spots remaining
              </p>
            </div>
          </div>


          <InfoCard
            title="Lecturer"
            action={allowLecturerAssignment ? {
              label: moduleDetails.lecturer ? 'Reassign' : 'Assign Lecturer',
              onClick: () => setShowLecturerSelect(!showLecturerSelect)
            } : undefined}
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
                  allowLecturerClick ? (
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
                    <div className="flex items-center gap-3 p-2">
                      <UserAvatar firstName={moduleDetails.lecturer.firstName} lastName={moduleDetails.lecturer.lastName} color="blue" />
                      <div>
                        <p className="font-medium text-gray-900">
                          {moduleDetails.lecturer.firstName} {moduleDetails.lecturer.lastName}
                        </p>
                        <p className="text-sm text-gray-600">{moduleDetails.lecturer.email}</p>
                      </div>
                    </div>
                  )
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

          {/* Meeting Button */}
          {onJoinMeeting && hasLecturer && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <button
                onClick={() => onJoinMeeting(updatedModule)}
                className={`w-full px-4 py-3 text-white rounded-lg font-medium transition-colors ${
                  currentUser?.role === 'LECTURER' 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                🎥 {currentUser?.role === 'LECTURER' ? 'Start Meeting' : 'Join Meeting'}
              </button>
            </div>
          )}

 
          {showStudentsList && (
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
                      rightElement={
                        isAdmin && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUnenroll(student.id);
                            }}
                            disabled={unenrolling === student.id}
                            className="px-3 py-1 text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {unenrolling === student.id ? 'Removing...' : 'Remove'}
                          </button>
                        )
                      }
                    />
                  ))}
                </div>
              )}
              
              {showEnrolledStudents && (!moduleDetails.enrolledStudents || moduleDetails.enrolledStudents.length === 0) && (
                <p className="text-sm text-gray-500 py-2">No students enrolled yet</p>
              )}
            </InfoCard>
          )}

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
