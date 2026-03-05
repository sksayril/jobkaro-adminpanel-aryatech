import { TrendingUp, Users, DollarSign, Activity } from 'lucide-react';

export default function Dashboard() {
  const stats = [
    {
      label: 'Total Revenue',
      value: '$45,231',
      change: '+12.5%',
      icon: DollarSign,
      color: 'bg-green-500',
    },
    {
      label: 'Active Users',
      value: '2,345',
      change: '+8.2%',
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      label: 'Growth Rate',
      value: '23.5%',
      change: '+3.1%',
      icon: TrendingUp,
      color: 'bg-purple-500',
    },
    {
      label: 'Activity',
      value: '1,234',
      change: '+15.3%',
      icon: Activity,
      color: 'bg-orange-500',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <span className="text-green-600 text-sm font-semibold">
                {stat.change}
              </span>
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">
              {stat.label}
            </h3>
            <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="flex items-center gap-4 pb-4 border-b border-gray-100 last:border-0">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Activity className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    New user registration
                  </p>
                  <p className="text-xs text-gray-600">{item} hour ago</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            {['Add User', 'Generate Report', 'View Analytics', 'Settings'].map((action) => (
              <button
                key={action}
                className="px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm font-medium text-gray-700 transition border border-gray-200"
              >
                {action}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
