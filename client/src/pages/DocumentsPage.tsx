import { FileText } from 'lucide-react';

export default function DocumentsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center py-20">
        <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <FileText className="w-12 h-12 text-purple-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">My Documents</h1>
        <p className="text-gray-600 text-lg max-w-md mx-auto">
          Access your medical documents, prescriptions, and lab results.
        </p>
        <div className="mt-8">
          <button className="bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors">
            Upload Document
          </button>
        </div>
      </div>
    </div>
  );
}