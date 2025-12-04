import { useState } from 'react';
import { Module } from '../../types';
import ModuleDetailModal from '../modals/ModuleDetailModal';

interface ModuleViewProps {
  modules: Module[];
  title: string;
  onModuleClick?: (module: Module) => void;
  emptyMessage?: string;
  className?: string;
  enableModal?: boolean;
  onModuleUpdate?: () => void;
}

export default function ModuleView({
  modules,
  title,
  onModuleClick,
  emptyMessage = "No modules found",
  className = "",
  enableModal = true,
  onModuleUpdate
}: ModuleViewProps) {
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [showModal, setShowModal] = useState(false);

  const handleModuleClick = (module: Module) => {
    if (onModuleClick) {
      onModuleClick(module);
    } else if (enableModal) {
      setSelectedModule(module);
      setShowModal(true);
    }
  };

  if (modules.length === 0) {
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Module Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Enrolled</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Limit</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {modules.map(module => {
              const isFull = module.enrolledCount >= module.limit;
              const percentFilled = (module.enrolledCount / module.limit) * 100;
              
              return (
                <tr 
                  key={module.id} 
                  className={`hover:bg-gray-50 ${(onModuleClick || enableModal) ? 'cursor-pointer' : ''}`}
                  onClick={(onModuleClick || enableModal) ? () => handleModuleClick(module) : undefined}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {module.code}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {module.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {module.enrolledCount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {module.limit}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        isFull ? 'bg-red-100 text-red-700' : 
                        percentFilled >= 80 ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {isFull ? 'Full' : percentFilled >= 80 ? 'Almost Full' : 'Open'}
                      </span>
                      <span className="text-xs text-gray-500">
                        {Math.round(percentFilled)}%
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>


      <div className="mt-4 text-sm text-gray-600">
        <p>Total modules: {modules.length}</p>
        {modules.filter(m => m.enrolledCount >= m.limit).length > 0 && (
          <p>Full modules: {modules.filter(m => m.enrolledCount >= m.limit).length}</p>
        )}
      </div>

      {/* Module Detail Modal - Fetches details on demand */}
      {selectedModule && enableModal && (
        <ModuleDetailModal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setSelectedModule(null);
          }}
          module={selectedModule}
          onModuleUpdate={onModuleUpdate}
        />
      )}
    </div>
  );
}