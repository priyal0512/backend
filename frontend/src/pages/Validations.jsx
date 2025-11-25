import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ValidationResults from '../components/features/ValidationResults';
import { validationService } from '../services/validationService';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import ErrorAlert from '../components/shared/ErrorAlert';

const Validations = () => {
  const [searchParams] = useSearchParams();
  const uploadId = searchParams.get('upload_id');
  const [validationId, setValidationId] = useState('');
  const [validationData, setValidationData] = useState(null);
  const [loading, setLoading] = useState(false);
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
    } catch (err) {
      setError(err.response?.data?.detail || 'Validation failed. Please check the ID.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (uploadId) {
      setValidationId(uploadId);
    }
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
    </div>
  );
};

export default Validations;

