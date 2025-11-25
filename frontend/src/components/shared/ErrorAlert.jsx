import { FiAlertCircle } from 'react-icons/fi';

const ErrorAlert = ({ message, onClose }) => {
  return (
    <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-center justify-between mb-4">
      <div className="flex items-center">
        <FiAlertCircle className="mr-2" />
        <span>{message}</span>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="text-red-600 hover:text-red-800 ml-4"
        >
          ×
        </button>
      )}
    </div>
  );
};

export default ErrorAlert;

