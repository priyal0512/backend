import { useState, useEffect } from 'react';
import FileUpload from '../components/features/FileUpload';
import { useNavigate } from 'react-router-dom';
import { dataService } from '../services/dataService';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import { FiFile } from 'react-icons/fi';

const Uploads = () => {
  const navigate = useNavigate();
  const [uploads, setUploads] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleUploadSuccess = (result) => {
    if (result.upload_id) {
      navigate(`/validations?upload_id=${result.upload_id}`);
    }
  };

  const fetchUploads = async () => {
    try {
      setLoading(true);
      const data = await dataService.getAllUploads();
      setUploads(data || []);
    } catch (error) {
      console.error('Failed to fetch uploads:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUploads();
    // Refresh every 5 seconds
    const interval = setInterval(fetchUploads, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Uploads</h1>
        <p className="text-gray-600">Upload and manage your term sheet documents</p>
      </div>

      <FileUpload onUploadSuccess={handleUploadSuccess} />

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Recent Uploads ({uploads.length})
        </h2>
        
        {loading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner />
          </div>
        ) : uploads.length === 0 ? (
          <p className="text-gray-500">
            No uploads yet. Upload a file to get started.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Filename</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Upload ID</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {uploads.map((upload) => (
                  <tr key={upload._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="flex items-center space-x-2">
                        <FiFile className="text-gray-400" />
                        <span>{upload.filename || 'Unknown'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                        {upload.status || 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 font-mono text-xs">
                      {upload._id.substring(0, 8)}...
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <button
                        onClick={() => navigate(`/validations?upload_id=${upload._id}`)}
                        className="text-primary-600 hover:text-primary-700 font-medium"
                      >
                        Validate
                      </button>
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

export default Uploads;

