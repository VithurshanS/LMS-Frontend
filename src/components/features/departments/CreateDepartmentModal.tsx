import Modal from '../../common/Modal';

interface CreateDepartmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  departmentName: string;
  onDepartmentNameChange: (name: string) => void;
  onSubmit: () => void;
  isCreating?: boolean;
}

export default function CreateDepartmentModal({
  isOpen,
  onClose,
  departmentName,
  onDepartmentNameChange,
  onSubmit,
  isCreating = false
}: CreateDepartmentModalProps) {
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
      title="Add New Department"
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Department Name
          </label>
          <input
            type="text"
            value={departmentName}
            onChange={(e) => onDepartmentNameChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., Physics"
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
              'Create'
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