import { Module, User } from '../types';

interface ModuleCardProps {
  module: Module;
  lecturer?: User;
  showLecturer?: boolean;
  showProgress?: boolean;
  actionButton?: React.ReactNode;
  onClick?: () => void;
}

export default function ModuleCard({ 
  module, 
  lecturer, 
  showLecturer = true, 
  showProgress = true,
  actionButton,
  onClick 
}: ModuleCardProps) {
  const isFull = module.enrolledCount >= module.limit;
  const percentage = Math.min((module.enrolledCount / module.limit) * 100, 100);

  return (
    <div 
      className={`bg-white rounded-lg shadow-md p-4 ${onClick ? 'cursor-pointer hover:shadow-lg transition-shadow' : ''}`}
      onClick={onClick}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900 text-lg">{module.name}</h4>
          <p className="text-sm text-gray-600">{module.code}</p>
        </div>
        <span className={`px-2 py-1 text-xs rounded-full whitespace-nowrap ml-2 ${
          isFull ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
        }`}>
          {isFull ? 'Full' : 'Open'}
        </span>
      </div>

      <div className="space-y-2 text-sm text-gray-600 mb-3">
        <div className="flex justify-between">
          <span>Enrolled Students:</span>
          <span className="font-medium text-gray-900">{module.enrolledCount}</span>
        </div>
        <div className="flex justify-between">
          <span>Capacity:</span>
          <span className="font-medium text-gray-900">{module.enrolledCount}/{module.limit}</span>
        </div>
        {showLecturer && lecturer && (
          <div className="pt-1 border-t border-gray-200">
            <span className="text-xs text-gray-500">Lecturer: </span>
            <span className="text-xs text-gray-700 font-medium">
              {lecturer.firstName} {lecturer.lastName}
            </span>
          </div>
        )}
      </div>

      {showProgress && (
        <div className="mb-3">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${
                isFull ? 'bg-red-600' : 'bg-green-600'
              }`}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      )}

      {actionButton && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          {actionButton}
        </div>
      )}
    </div>
  );
}
