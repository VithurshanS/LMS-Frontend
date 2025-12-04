import UserAvatar from './UserAvatar';
import { User } from '../../types';

interface UserListItemProps {
  user: User;
  onClick?: () => void;
  isClickable?: boolean;
  avatarColor?: 'blue' | 'green' | 'purple';
  rightElement?: React.ReactNode;
}

export default function UserListItem({ 
  user, 
  onClick, 
  isClickable = true,
  avatarColor = 'blue',
  rightElement
}: UserListItemProps) {
  const Component = isClickable && onClick ? 'button' : 'div';
  
  return (
    <Component
      onClick={onClick}
      className={`w-full flex items-center gap-3 p-2 rounded ${
        isClickable && onClick ? 'hover:bg-gray-50 cursor-pointer transition-colors' : ''
      }`}
    >
      <UserAvatar 
        firstName={user.firstName} 
        lastName={user.lastName}
        size="sm"
        color={avatarColor}
      />
      <div className="flex-1 text-left">
        <p className="text-sm font-medium text-gray-900">
          {user.firstName} {user.lastName}
        </p>
        <p className="text-xs text-gray-600">{user.email}</p>
      </div>
      {rightElement}
    </Component>
  );
}
