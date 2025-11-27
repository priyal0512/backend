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

          {/* Summary Stats */}
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Summary</h3>
            <div className="space-y-4">
              {summary && Object.entries(summary).map(([key, value]) => (
                <div key={key} className="flex justify-between items-center pb-3 border-b border-gray-200">
                  <span className="text-gray-600 capitalize">{key.replace(/_/g, ' ')}</span>
                  <span className="font-semibold text-gray-900">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Issues Section */}
      {issues && issues.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Issues Found</h2>
          <div className="space-y-3">
            {issues.map((issue, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-red-50 rounded-lg">
                <FiAlertCircle className="text-red-600 mt-1 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-gray-900 font-medium">{issue.field || 'Field'}</p>
                  <p className="text-gray-600 text-sm">{issue.message || issue}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Validated Fields */}
      {validated_fields && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Validated Fields</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(validated_fields).map(([field, value]) => (
              <div key={field} className="p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-600 text-sm capitalize">{field.replace(/_/g, ' ')}</p>
                <p className="text-gray-900 font-semibold mt-1">{String(value)}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ValidationResults;
