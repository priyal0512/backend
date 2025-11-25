import { FiCheckCircle, FiXCircle, FiAlertCircle } from 'react-icons/fi';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const ValidationResults = ({ validationData }) => {
  if (!validationData) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <p className="text-gray-500">No validation data available</p>
      </div>
    );
  }

  const { score, status, issues, validated_fields, summary } = validationData;

  const chartData = [
    { name: 'Valid', value: score || 0, color: '#10b981' },
    { name: 'Issues', value: 100 - (score || 0), color: '#ef4444' },
  ];

  const getStatusIcon = () => {
    if (status === 'Valid' || status === 'Approved') {
      return <FiCheckCircle className="text-green-600 text-2xl" />;
    } else if (status === 'Invalid' || status === 'Rejected') {
      return <FiXCircle className="text-red-600 text-2xl" />;
    } else {
      return <FiAlertCircle className="text-yellow-600 text-2xl" />;
    }
  };

  const getStatusColor = () => {
    if (status === 'Valid' || status === 'Approved') {
      return 'bg-green-100 text-green-800';
    } else if (status === 'Invalid' || status === 'Rejected') {
      return 'bg-red-100 text-red-800';
    } else {
      return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Score and Status */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Validation Results</h2>
          <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${getStatusColor()}`}>
            {getStatusIcon()}
            <span className="font-semibold">{status || 'Pending'}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Score Chart */}
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Validation Score</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
            <div className="text-center mt-4">
              <p className="text-4xl font-bold text-gray-900">{score || 0}%</p>
              <p className="text-sm text-gray-500">Overall Score</p>
            </div>
          </div>

          {/* Summary */}
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Summary</h3>
            <p className="text-gray-600 leading-relaxed">{summary || 'No summary available'}</p>
          </div>
        </div>
      </div>

      {/* Issues */}
      {issues && issues.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">
            Issues Found ({issues.length})
          </h3>
          <div className="space-y-3">
            {issues.map((issue, index) => (
              <div
                key={index}
                className="bg-red-50 border border-red-200 rounded-lg p-4"
              >
                <div className="flex items-start">
                  <FiAlertCircle className="text-red-600 mt-1 mr-3 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-red-900">
                      {issue.field || issue.title || `Issue ${index + 1}`}
                    </p>
                    <p className="text-sm text-red-700 mt-1">
                      {issue.message || issue.description || 'Issue detected'}
                    </p>
                    {issue.severity && (
                      <span className="inline-block mt-2 px-2 py-1 bg-red-200 text-red-800 text-xs rounded">
                        {issue.severity}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Validated Fields */}
      {validated_fields && Object.keys(validated_fields).length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Validated Fields</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(validated_fields).map(([key, value]) => (
              <div key={key} className="border border-gray-200 rounded-lg p-3">
                <p className="text-sm font-medium text-gray-600 uppercase">{key}</p>
                <p className="text-gray-900 mt-1">
                  {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ValidationResults;

