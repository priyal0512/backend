const StatusBadge = ({ status }) => {
  const statusConfig = {
    parsed: { color: 'bg-blue-100 text-blue-800', label: 'Parsed' },
    validated: { color: 'bg-green-100 text-green-800', label: 'Validated' },
    pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
    error: { color: 'bg-red-100 text-red-800', label: 'Error' },
    uploaded: { color: 'bg-gray-100 text-gray-800', label: 'Uploaded' },
  };

  const config = statusConfig[status] || statusConfig.pending;

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
      {config.label}
    </span>
  );
};

export default StatusBadge;

