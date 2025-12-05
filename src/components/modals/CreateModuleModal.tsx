import Modal from './Modal';
import { User } from '../../types';

interface CreateModuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  departmentName?: string;
  moduleData: {
    code: string;
    name: string;
    lecturerId: string;
    limit: number;
  };
  onModuleDataChange: (data: { code: string; name: string; lecturerId: string; limit: number }) => void;
  onSubmit: () => void;
  lecturers: User[];
  isCreating?: boolean;
}

export default function CreateModuleModal({
  isOpen,
  onClose,
  departmentName,
  moduleData,
  onModuleDataChange,
  onSubmit,
  lecturers,
  isCreating = false
}: CreateModuleModalProps) {
  const handleSubmit = () => {
    onSubmit();
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={`Add Module${departmentName ? ` to ${departmentName}` : ''}`}
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Module Code
          </label>
          <input
            type="text"
            value={moduleData.code}
            onChange={(e) => onModuleDataChange({ ...moduleData, code: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., CS301"
            disabled={isCreating}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Module Name
          </label>
          <input
            type="text"
            value={moduleData.name}
            onChange={(e) => onModuleDataChange({ ...moduleData, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., Advanced Programming"
            disabled={isCreating}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Assign Lecturer <span className="text-gray-500 text-xs">(Optional)</span>
          </label>
          <select
            value={moduleData.lecturerId}
            onChange={(e) => onModuleDataChange({ ...moduleData, lecturerId: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isCreating}
          >
            <option value="">Select a lecturer (optional)</option>
            {lecturers.filter(l => l.isActive).map(lecturer => (
              <option key={lecturer.id} value={lecturer.id}>
                {lecturer.firstName} {lecturer.lastName}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Student Limit
          </label>
          <input
            type="number"
            value={moduleData.limit}
            onChange={(e) => onModuleDataChange({ ...moduleData, limit: parseInt(e.target.value) || 30 })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            min="1"
            max="100"
            disabled={isCreating}
          />
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleSubmit}
            disabled={isCreating}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isCreating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Creating...
              </>
            ) : (
              'Create Module'
            )}
          </button>
          <button
            onClick={handleClose}
            disabled={isCreating}
            className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
        </div>
      </div>
    </Modal>
  );
}