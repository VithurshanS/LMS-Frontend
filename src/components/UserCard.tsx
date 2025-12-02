import { User, Department } from '../types';

interface UserCardProps {
  user: User;
  department?: Department;
  onClick?: () => void;
  actionButton?: React.ReactNode;
}

export default function UserCard({ user, department, onClick, actionButton }: UserCardProps) {
  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-purple-100 text-purple-700';
      case 'LECTURER':
        return 'bg-blue-100 text-blue-700';
      case 'STUDENT':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div 
      className={`bg-white rounded-lg shadow p-4 ${onClick ? 'cursor-pointer hover:shadow-lg transition-shadow' : ''}`}
      onClick={onClick}
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <h4 className="font-semibold text-gray-900">
            {user.firstName} {user.lastName}
          </h4>
          <p className="text-sm text-gray-600">{user.email}</p>
        </div>
        <span className={`px-2 py-1 text-xs rounded-full ${getRoleBadgeColor(user.role)}`}>
          {user.role}
        </span>
      </div>

      <div className="space-y-1 text-sm text-gray-600">
        <div className="flex justify-between">
          <span>Username:</span>
          <span className="font-medium text-gray-900">{user.username}</span>
        </div>
        {department && (
          <div className="flex justify-between">
            <span>Department:</span>
            <span className="font-medium text-gray-900">{department.name}</span>
          </div>
        )}
        {user.role === 'LECTURER' && (
          <div className="flex justify-between items-center pt-2">
            <span>Status:</span>
            <span className={`px-2 py-1 text-xs rounded-full ${
              user.isActive ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
            }`}>
              {user.isActive ? 'Active' : 'Pending'}
            </span>
          </div>
        )}
      </div>

      {actionButton && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          {actionButton}
        </div>
      )}
    </div>
  );
}
