import { Settings, User, Bell, Shield, Palette } from 'lucide-react';

export default function SettingsPage() {
  const settingsSections = [
    {
      title: 'Profile Settings',
      icon: User,
      description: 'Manage your profile information and preferences',
      color: 'bg-blue-500',
    },
    {
      title: 'Notifications',
      icon: Bell,
      description: 'Configure your notification preferences',
      color: 'bg-green-500',
    },
    {
      title: 'Security',
      icon: Shield,
      description: 'Manage your security and privacy settings',
      color: 'bg-red-500',
    },
    {
      title: 'Appearance',
      icon: Palette,
      description: 'Customize the look and feel of your dashboard',
      color: 'bg-purple-500',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <Settings className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {settingsSections.map((section, index) => (
            <div
              key={index}
              className="p-6 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition cursor-pointer"
            >
              <div className="flex items-start gap-4">
                <div className={`${section.color} p-3 rounded-lg`}>
                  <section.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">{section.title}</h3>
                  <p className="text-sm text-gray-600">{section.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
