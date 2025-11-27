import { useState } from 'react';
import { FiDownload, FiFileText } from 'react-icons/fi';
import { reportService } from '../../services/reportService';
import LoadingSpinner from '../shared/LoadingSpinner';
import ErrorAlert from '../shared/ErrorAlert';

const ReportsExport = () => {
  const [validationId, setValidationId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [reportGenerated, setReportGenerated] = useState(false);

  const handleExport = async () => {
    if (!validationId.trim()) {
      setError('Please enter a validation ID');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await reportService.exportReport(validationId);
      if (result.report_link) {
        setSuccess(`Report generated successfully!`);
        setReportGenerated(true);
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to export report. Please check the validation ID.');
      setReportGenerated(false);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!validationId.trim()) {
      setError('Please enter a validation ID');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await reportService.downloadReport(validationId);
      setSuccess('Report downloaded successfully!');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to download report.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center space-x-3 mb-6">
        <FiFileText className="text-primary-600 text-2xl" />
        <h2 className="text-2xl font-semibold text-gray-900">Export Reports</h2>
      </div>

      {error && <ErrorAlert message={error} onClose={() => setError(null)} />}
      
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg mb-4">
          {success}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Validation ID
          </label>
          <input
            type="text"
            value={validationId}
            onChange={(e) => setValidationId(e.target.value)}
            placeholder="Enter validation ID to export report"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <p className="mt-2 text-sm text-gray-500">
            Enter the validation ID from a completed validation to generate and download the report.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleExport}
            disabled={loading || !validationId.trim()}
            className="flex-1 px-4 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 disabled:bg-primary-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
          >
            {loading && !reportGenerated ? (
              <>
                <LoadingSpinner size="sm" />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <FiFileText />
                <span>Generate Report</span>
              </>
            )}
          </button>

          <button
            onClick={handleDownload}
            disabled={loading || !validationId.trim() || !reportGenerated}
            className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
          >
            {loading && reportGenerated ? (
              <>
                <LoadingSpinner size="sm" />
                <span>Downloading...</span>
              </>
            ) : (
              <>
                <FiDownload />
                <span>Download JSON</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportsExport;

