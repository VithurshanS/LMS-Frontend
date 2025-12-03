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
}

export default function CreateModuleModal({
  isOpen,
  onClose,
  departmentName,
  moduleData,
  onModuleDataChange,
  onSubmit,
  lecturers
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
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Assign Lecturer
          </label>
          <select
            value={moduleData.lecturerId}
            onChange={(e) => onModuleDataChange({ ...moduleData, lecturerId: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select a lecturer</option>
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
          />
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleSubmit}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create Module
          </button>
          <button
            onClick={handleClose}
            className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </Modal>
  );
}