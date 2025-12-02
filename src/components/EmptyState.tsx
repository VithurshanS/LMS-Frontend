interface EmptyStateProps {
  title?: string;
  message: string;
  icon?: React.ReactNode;
}

export default function EmptyState({ title, message, icon }: EmptyStateProps) {
  return (
    <div className="bg-white rounded-lg shadow p-8 text-center">
      {icon && (
        <div className="flex justify-center mb-4 text-gray-400">
          {icon}
        </div>
      )}
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      )}
      <p className="text-gray-600">{message}</p>
    </div>
  );
}
