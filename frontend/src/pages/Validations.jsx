import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ValidationResults from '../components/features/ValidationResults';
import { validationService } from '../services/validationService';
import { dataService } from '../services/dataService';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import ErrorAlert from '../components/shared/ErrorAlert';
import { FiCheckCircle, FiXCircle, FiAlertCircle } from 'react-icons/fi';

const Validations = () => {
  const [searchParams] = useSearchParams();
  const uploadId = searchParams.get('upload_id');
  const [validationId, setValidationId] = useState('');
  const [validationData, setValidationData] = useState(null);
  const [allValidations, setAllValidations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [listLoading, setListLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleValidate = async () => {
    if (!validationId.trim() && !uploadId) {
      setError('Please enter a validation ID or upload ID');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const idToUse = uploadId || validationId;
      const result = await validationService.validateUpload(idToUse);
      setValidationData(result);
      setValidationId(result.validation_id || '');
      // Refresh the list
      fetchValidations();
    } catch (err) {
      setError(err.response?.data?.detail || 'Validation failed. Please check the ID.');
    } finally {
      setLoading(false);
    }
  };

  const fetchValidations = async () => {
    try {
      setListLoading(true);
      const data = await dataService.getAllValidations();
      setAllValidations(data || []);
    } catch (error) {
      console.error('Failed to fetch validations:', error);
    } finally {
      setListLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    if (status === 'Valid' || status === 'Approved') {
      return <FiCheckCircle className="text-green-600" />;
    } else if (status === 'Invalid' || status === 'Rejected') {
      return <FiXCircle className="text-red-600" />;
    } else {
      return <FiAlertCircle className="text-yellow-600" />;
    }
  };

  const getStatusColor = (status) => {
    if (status === 'Valid' || status === 'Approved') {
      return 'bg-green-100 text-green-800';
    } else if (status === 'Invalid' || status === 'Rejected') {
      return 'bg-red-100 text-red-800';
    } else {
      return 'bg-yellow-100 text-yellow-800';
    }
  };

  useEffect(() => {
    if (uploadId) {
      setValidationId(uploadId);
    }
    fetchValidations();
    // Refresh every 5 seconds
    const interval = setInterval(fetchValidations, 5000);
    return () => clearInterval(interval);
  }, [uploadId]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Validations</h1>
        <p className="text-gray-600">Validate uploaded term sheets and view results</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Run Validation</h2>
        
        {error && <ErrorAlert message={error} onClose={() => setError(null)} />}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload ID
            </label>
            <input
              type="text"
              value={validationId}
              onChange={(e) => setValidationId(e.target.value)}
              placeholder="Enter upload ID to validate"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              disabled={!!uploadId}
            />
            {uploadId && (
              <p className="mt-2 text-sm text-gray-500">
                Validating upload: {uploadId}
              </p>
            )}
          </div>

          <button
            onClick={handleValidate}
            disabled={loading || (!validationId.trim() && !uploadId)}
            className="w-full px-4 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 disabled:bg-primary-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <LoadingSpinner size="sm" />
                <span>Validating...</span>
              </>
            ) : (
              <span>Validate</span>
            )}
          </button>
        </div>
      </div>

      {validationData && <ValidationResults validationData={validationData} />}

      {/* All Validations List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          All Validations ({allValidations.length})
        </h2>

        {listLoading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner />
          </div>
        ) : allValidations.length === 0 ? (
          <p className="text-gray-500">No validations yet. Validate an uploaded file to get started.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Score</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Fields Valid</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Issues</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">ID</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {allValidations.map((validation) => (
                  <tr key={validation._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(validation.status)}
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(validation.status)}`}>
                          {validation.status || 'Pending'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                      {validation.score || 0}%
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {validation.summary || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className="px-2 py-1 bg-red-50 text-red-700 rounded text-xs font-medium">
                        {validation.issues?.length || 0} issue(s)
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 font-mono text-xs">
                      {validation._id.substring(0, 8)}...
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Validations;

