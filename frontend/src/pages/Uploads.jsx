import { useState } from 'react';
import FileUpload from '../components/features/FileUpload';
import { useNavigate } from 'react-router-dom';

const Uploads = () => {
  const navigate = useNavigate();

  const handleUploadSuccess = (result) => {
    if (result.upload_id) {
      navigate(`/validations?upload_id=${result.upload_id}`);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Uploads</h1>
        <p className="text-gray-600">Upload and manage your term sheet documents</p>
      </div>

      <FileUpload onUploadSuccess={handleUploadSuccess} />

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Uploads</h2>
        <p className="text-gray-500">
          Upload history will be displayed here. Upload a file to get started.
        </p>
      </div>
    </div>
  );
};

export default Uploads;

