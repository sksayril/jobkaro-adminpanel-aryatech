import { BarChart3, TrendingUp, PieChart } from 'lucide-react';

export default function Analytics() {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <BarChart3 className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">Analytics Overview</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-blue-50 rounded-lg border border-blue-100">
            <TrendingUp className="w-8 h-8 text-blue-600 mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Growth Metrics</h3>
            <p className="text-gray-600">Track your growth over time with detailed analytics.</p>
          </div>
          <div className="p-6 bg-green-50 rounded-lg border border-green-100">
            <PieChart className="w-8 h-8 text-green-600 mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">User Segments</h3>
            <p className="text-gray-600">Understand your user base with segmentation data.</p>
          </div>
          <div className="p-6 bg-purple-50 rounded-lg border border-purple-100">
            <BarChart3 className="w-8 h-8 text-purple-600 mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Performance</h3>
            <p className="text-gray-600">Monitor key performance indicators in real-time.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
