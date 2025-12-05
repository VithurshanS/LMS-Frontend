import { useState, useEffect } from 'react';
import { User, Department, Module } from '../../types';
import Modal from './Modal';
import ModuleDetailModal from './ModuleDetailModal';
import { InfoCard } from '../ui';
import { getModulesbyLecturerId, controlUserAccess } from '../../api/api';

interface LecturerDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  lecturer: User;
  department?: Department;
  onLecturerUpdate?: () => void;
  currentUser?: User;
}

export default function LecturerDetailModal({
  isOpen,
  onClose,
  lecturer,
  department,
  onLecturerUpdate,
  currentUser
}: LecturerDetailModalProps) {
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [showModules, setShowModules] = useState(false);
  const [teachingModules, setTeachingModules] = useState<Module[]>([]);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [showModuleModal, setShowModuleModal] = useState(false);
  
  const isAdmin = currentUser?.role === 'ADMIN';

  useEffect(() => {
    if (isOpen && lecturer) {
      fetchTeachingModules();
    }
  }, [isOpen, lecturer.id]);

  const fetchTeachingModules = async () => {
    setLoading(true);
    try {
      const modules = await getModulesbyLecturerId(lecturer.id);
      setTeachingModules(modules);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const handleApproveLecturer = async () => {
    setActionLoading(true);
    try {
      const success = await controlUserAccess({
        id: lecturer.id,
        control: 'UNBAN',
        role: 'lecturer'
      });
      if (success) {
        alert('Lecturer approved successfully!');
        if (onLecturerUpdate) {
          onLecturerUpdate();
        }
        onClose();
      } else {
        alert('Failed to approve lecturer. Please try again.');
      }
    } catch (error) {
      alert('Failed to approve lecturer. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleBanLecturer = async () => {
    if (!confirm(`Are you sure you want to ban ${lecturer.firstName} ${lecturer.lastName}?`)) {
      return;
    }
    
    setActionLoading(true);
    try {
      const success = await controlUserAccess({
        id: lecturer.id,
        control: 'BAN',
        role: 'lecturer'
      });
      if (success) {
        alert('Lecturer banned successfully!');
        if (onLecturerUpdate) {
          onLecturerUpdate();
        }
        onClose();
      } else {
        alert('Failed to ban lecturer. Please try again.');
      }
    } catch (error) {
      alert('Failed to ban lecturer. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Lecturer Details" maxWidth="2xl">
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-3">Personal Information</h4>
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

          <InfoCard
            title={`Teaching Modules (${teachingModules.length})`}
            action={{
              label: showModules ? 'Hide Modules' : 'Show Modules',
              onClick: () => setShowModules(!showModules)
            }}
          >
            {showModules && teachingModules.length === 0 && (
              <p className="text-sm text-gray-500 py-2">No modules assigned yet</p>
            )}

            {showModules && teachingModules.length > 0 && (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {teachingModules.map((module) => {
                  const isFull = module.enrolledCount >= module.limit;
                  const percentFilled = (module.enrolledCount / module.limit) * 100;
                  
                  return (
                    <button
                      key={module.id}
                      onClick={() => {
                        setSelectedModule(module);
                        setShowModuleModal(true);
                      }}
                      className="w-full bg-white border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition-colors cursor-pointer text-left"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h5 className="font-semibold text-gray-900">{module.name}</h5>
                          <p className="text-xs text-gray-600">{module.code}</p>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          isFull ? 'bg-red-100 text-red-700' : 
                          percentFilled >= 80 ? 'bg-yellow-100 text-yellow-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {isFull ? 'Full' : percentFilled >= 80 ? 'Almost Full' : 'Open'}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        <p>Enrolled: {module.enrolledCount}/{module.limit} students</p>
                      </div>
                      <div className="mt-2">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all ${
                              isFull ? 'bg-red-600' : 
                              percentFilled >= 80 ? 'bg-yellow-600' :
                              'bg-green-600'
                            }`}
                            style={{
                              width: `${Math.min(percentFilled, 100)}%`
                            }}
                          />
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </InfoCard>

          {isAdmin && (
          <div className="space-y-3 pt-4 border-t">
              {!lecturer.isActive && (
                <button
                  onClick={handleApproveLecturer}
                  disabled={actionLoading}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {actionLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    'Approve Lecturer'
                  )}
                </button>
              )}

              {lecturer.isActive && (
                <>
                  <button
                    onClick={handleBanLecturer}
                    disabled={actionLoading}
                    className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {actionLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Processing...
                      </>
                    ) : (
                      'Ban Lecturer'
                    )}
                  </button>
                </>
              )}
            </div>
          )}

          <div className="pt-4 border-t">
            <button
              onClick={onClose}
              disabled={actionLoading}
              className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              Close
            </button>
          </div>
        </div>
        )}

      {selectedModule && (
        <ModuleDetailModal
          isOpen={showModuleModal}
          onClose={() => {
            setShowModuleModal(false);
            setSelectedModule(null);
          }}
          module={selectedModule}
          onModuleUpdate={fetchTeachingModules}
          currentUser={currentUser}
        />
      )}
    </Modal>
  );
}
