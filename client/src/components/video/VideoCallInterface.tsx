import React, { useState } from 'react';
import { Mic, MicOff, Video, VideoOff, Monitor, Users, Settings, PhoneOff, ArrowLeft } from 'lucide-react';
import NotesPanel from './NotesPanel';

interface VideoCallInterfaceProps {
  doctorName: string;
  onEndCall: () => void;
  onBackToAppointments: () => void;
}

export default function VideoCallInterface({ doctorName, onEndCall, onBackToAppointments }: VideoCallInterfaceProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  const controls = [
    {
      icon: isMuted ? MicOff : Mic,
      label: isMuted ? 'Unmute' : 'Mute',
      active: isMuted,
      onClick: () => setIsMuted(!isMuted)
    },
    {
      icon: isVideoOff ? VideoOff : Video,
      label: isVideoOff ? 'Start Video' : 'Stop Video',
      active: isVideoOff,
      onClick: () => setIsVideoOff(!isVideoOff)
    },
    {
      icon: Monitor,
      label: 'Share Screen',
      active: isScreenSharing,
      onClick: () => setIsScreenSharing(!isScreenSharing)
    },
    {
      icon: Users,
      label: 'Participants',
      active: false,
      onClick: () => console.log('Participants')
    },
    {
      icon: Settings,
      label: 'Settings',
      active: false,
      onClick: () => console.log('Settings')
    }
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Main Video Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBackToAppointments}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Appointments</span>
            </button>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-500">Document tabs would go here</span>
          </div>
        </div>

        {/* Secondary Navigation */}
        <div className="bg-gray-100 px-6 py-3 border-b border-gray-200">
          <div className="flex space-x-8">
            <button className="bg-cyan-600 text-white px-4 py-2 rounded-md text-sm font-medium">
              Notes
            </button>
            <button className="text-gray-600 hover:text-gray-800 px-4 py-2 text-sm font-medium">
              E - Prescription
            </button>
            <button className="text-gray-600 hover:text-gray-800 px-4 py-2 text-sm font-medium">
              Lab / Diagnostic Requests
            </button>
            <button className="text-gray-600 hover:text-gray-800 px-4 py-2 text-sm font-medium">
              All documents
            </button>
            <button className="ml-auto text-gray-400">
              <span>⋯</span>
            </button>
          </div>
        </div>

        {/* Video Call Area */}
        <div className="flex-1 relative bg-gray-800">
          {/* Doctor Name Badge */}
          <div className="absolute top-4 left-4 z-10">
            <div className="bg-gray-900 bg-opacity-75 text-white px-3 py-1 rounded-md text-sm">
              {doctorName}
            </div>
          </div>

          {/* Main Video Stream */}
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-gray-400 text-lg">
              [ Doctor's Video Stream ]
            </div>
          </div>

          {/* Patient Camera (Picture-in-Picture) */}
          <div className="absolute bottom-20 right-6 w-48 h-36 bg-gray-700 rounded-lg border-2 border-gray-600 flex items-center justify-center">
            <div className="text-gray-400 text-sm">
              [ Patient's Camera ]
            </div>
          </div>

          {/* Video Controls */}
          <div className="absolute bottom-0 left-0 right-0 bg-gray-900 bg-opacity-90 p-4">
            <div className="flex items-center justify-center space-x-6">
              {controls.map((control, index) => (
                <button
                  key={index}
                  onClick={control.onClick}
                  className={`flex flex-col items-center space-y-1 p-3 rounded-lg transition-colors ${
                    control.active 
                      ? 'bg-red-600 text-white' 
                      : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                  }`}
                >
                  <control.icon className="h-6 w-6" />
                  <span className="text-xs">{control.label}</span>
                </button>
              ))}
              
              {/* End Call Button */}
              <button
                onClick={onEndCall}
                className="flex flex-col items-center space-y-1 p-3 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors"
              >
                <PhoneOff className="h-6 w-6" />
                <span className="text-xs">End Call</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Notes Panel */}
      <div className="w-80 bg-white border-l border-gray-200">
        <NotesPanel />
      </div>
    </div>
  );
}