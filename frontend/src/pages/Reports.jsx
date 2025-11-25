import ReportsExport from '../components/features/ReportsExport';

const Reports = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Reports</h1>
        <p className="text-gray-600">Generate and export validation reports</p>
      </div>

      <ReportsExport />
    </div>
  );
};

export default Reports;

