import { FileText, Download } from 'lucide-react';

export default function Reports() {
  const reports = [
    { name: 'Monthly Sales Report', date: '2024-03-01', size: '2.4 MB' },
    { name: 'User Activity Report', date: '2024-03-01', size: '1.8 MB' },
    { name: 'Financial Summary', date: '2024-02-28', size: '3.2 MB' },
    { name: 'Analytics Overview', date: '2024-02-28', size: '1.5 MB' },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <FileText className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">Reports</h2>
        </div>

        <div className="space-y-3">
          {reports.map((report, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{report.name}</h3>
                  <p className="text-sm text-gray-600">
                    {report.date} • {report.size}
                  </p>
                </div>
              </div>
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                <Download className="w-4 h-4" />
                Download
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
