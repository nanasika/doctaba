import React, { useState } from 'react';

export default function NotesPanel() {
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');

  const handleSave = () => {
    console.log('Saving notes:', { title, notes });
    // Here you would typically save to a backend or state management solution
    alert('Notes saved successfully!');
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Notes</h2>
      </div>

      {/* Notes Form */}
      <div className="flex-1 p-6 space-y-6">
        {/* Title Input */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            Title
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter title..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          />
        </div>

        {/* Notes Textarea */}
        <div className="flex-1 flex flex-col">
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
            My Notes
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Enter your notes here..."
            rows={15}
            className="flex-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-none"
          />
        </div>
      </div>

      {/* Save Button */}
      <div className="p-6 border-t border-gray-200">
        <button
          onClick={handleSave}
          className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-3 px-4 rounded-md transition-colors duration-200"
        >
          Save
        </button>
      </div>
    </div>
  );
}