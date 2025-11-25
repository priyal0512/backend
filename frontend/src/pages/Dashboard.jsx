import { useState, useEffect } from 'react';
import StatsOverview from '../components/features/StatsOverview';
import FileUpload from '../components/features/FileUpload';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalUploads: 0,
    totalValidations: 0,
    successRate: 0,
    totalIssues: 0,
  });
  const navigate = useNavigate();

  const handleUploadSuccess = (result) => {
    // Navigate to validations page or show success message
    if (result.upload_id) {
      navigate(`/validations?upload_id=${result.upload_id}`);
    }
  };

  // In a real app, you would fetch stats from an API
  // For now, we'll use placeholder data
  useEffect(() => {
    // This would be replaced with an actual API call
    // const fetchStats = async () => {
    //   const data = await dashboardService.getStats();
    //   setStats(data);
    // };
    // fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Welcome to the Term Sheet Validation System</p>
      </div>

      <StatsOverview stats={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FileUpload onUploadSuccess={handleUploadSuccess} />
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/uploads')}
              className="w-full px-4 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors text-left"
            >
              View All Uploads
            </button>
            <button
              onClick={() => navigate('/validations')}
              className="w-full px-4 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors text-left"
            >
              View Validations
            </button>
            <button
              onClick={() => navigate('/chatbot')}
              className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors text-left"
            >
              Ask AI Assistant
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

