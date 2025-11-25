import { FiUpload, FiCheckCircle, FiAlertTriangle, FiTrendingUp } from 'react-icons/fi';

const StatsOverview = ({ stats }) => {
  const statCards = [
    {
      title: 'Total Uploads',
      value: stats?.totalUploads || 0,
      icon: FiUpload,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Validations',
      value: stats?.totalValidations || 0,
      icon: FiCheckCircle,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Success Rate',
      value: stats?.successRate ? `${stats.successRate}%` : '0%',
      icon: FiTrendingUp,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Issues Found',
      value: stats?.totalIssues || 0,
      icon: FiAlertTriangle,
      color: 'bg-orange-500',
      bgColor: 'bg-orange-50',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div
            key={index}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
              </div>
              <div className={`${stat.bgColor} p-3 rounded-lg`}>
                <Icon className={`${stat.color.replace('bg-', 'text-')} text-2xl`} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StatsOverview;

