interface UserAvatarProps {
  firstName: string;
  lastName: string;
  size?: 'sm' | 'md' | 'lg';
  color?: 'blue' | 'green' | 'purple';
}

export default function UserAvatar({ 
  firstName, 
  lastName, 
  size = 'md',
  color = 'blue' 
}: UserAvatarProps) {
  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg'
  };

  const colorClasses = {
    blue: 'bg-blue-100 text-blue-700',
    green: 'bg-green-100 text-green-700',
    purple: 'bg-purple-100 text-purple-700'
  };

  return (
    <div className={`${sizeClasses[size]} ${colorClasses[color]} rounded-full flex items-center justify-center`}>
      <span className="font-semibold">
        {firstName[0]}{lastName[0]}
      </span>
    </div>
  );
}
