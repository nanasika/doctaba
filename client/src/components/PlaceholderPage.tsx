import React from 'react';

interface PlaceholderPageProps {
  title: string;
  description: string;
  icon: React.ReactNode;
}

export default function PlaceholderPage({ title, description, icon }: PlaceholderPageProps) {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center">
        <div className="mx-auto h-24 w-24 text-gray-300 mb-8">
          {icon}
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{title}</h1>
        <p className="text-lg text-gray-600 mb-8">{description}</p>
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-left max-w-2xl mx-auto">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Coming Soon:</h3>
          <ul className="space-y-2 text-gray-600">
            <li>• Full feature implementation</li>
            <li>• Real-time updates</li>
            <li>• Enhanced user interface</li>
            <li>• Integration with backend services</li>
          </ul>
        </div>
      </div>
    </div>
  );
}