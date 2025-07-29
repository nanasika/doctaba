import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { Phone, FileText, Users, PhoneOff, MessageCircle, UserPlus, Volume2, MoreVertical, Copy, Camera, MicOff } from 'lucide-react';

interface VideoCallPageProps {
  appointmentId: string;
  onEndCall: () => void;
}

// Declare Jitsi types
declare global {
  interface Window {
    JitsiMeetExternalAPI: any;
  }
}

export default function VideoCallPage({ appointmentId, onEndCall }: VideoCallPageProps) {
  const [callDuration, setCallDuration] = useState(0);
  const [showNotes, setShowNotes] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [notes, setNotes] = useState('');
  const [jitsiLoaded, setJitsiLoaded] = useState(false);

  const [participants, setParticipants] = useState<any[]>([]);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const jitsiContainerRef = useRef<HTMLDivElement>(null);
  const jitsiApiRef = useRef<any>(null);
  const [, setLocation] = useLocation();

  // Call duration timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Simple Jitsi initialization
  useEffect(() => {
    let mounted = true;

    const initJitsi = async () => {
      try {
        // Load Jitsi script if not loaded
        if (!window.JitsiMeetExternalAPI) {
          const script = document.createElement('script');
          script.src = 'https://meet.jit.si/external_api.js';
          script.async = true;
          
          await new Promise((resolve, reject) => {
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
          });
        }

        if (!mounted || !jitsiContainerRef.current) return;

        // Enhanced Jitsi configuration with all features
        const api = new window.JitsiMeetExternalAPI('meet.jit.si', {
          roomName: `doctaba-${appointmentId}`,
          parentNode: jitsiContainerRef.current,
          width: '100%',
          height: '100%',
          configOverwrite: {
            prejoinPageEnabled: false,
            startWithAudioMuted: false,
            startWithVideoMuted: false,
            disableFilmstripAutohiding: false,
            filmstrip: { disabled: false },
            disableTileView: false,
            disableSelfView: false,
            enableWelcomePage: false,
            enableClosePage: false,
            defaultLocalDisplayName: 'You',
            defaultRemoteDisplayName: 'Participant',
            requireDisplayName: false,
            enableLayerSuspension: true,
            enableNoisyMicDetection: true,
            startAudioOnly: false,
            channelLastN: 4,
            enableUserRolesBasedOnToken: false,
            enableFeaturesBasedOnToken: false,
            disableInviteFunctions: false,
            doNotStoreRoom: false,
            deploymentInfo: {
              shard: 'meet-jit-si-eu-west-1b-s3',
              region: 'eu-west-1',
              userRegion: 'eu-west-1'
            }
          },
          interfaceConfigOverwrite: {
            FILMSTRIP_ENABLED: true,
            DISABLE_TILE_VIEW: false,
            TOOLBAR_BUTTONS: [
              'microphone', 'camera', 'closedcaptions', 'desktop', 'fullscreen',
              'fodeviceselection', 'hangup', 'profile', 'chat', 'recording',
              'livestreaming', 'etherpad', 'sharedvideo', 'settings', 'raisehand',
              'videoquality', 'filmstrip', 'invite', 'feedback', 'stats', 'shortcuts',
              'tileview', 'videobackgroundblur', 'download', 'help', 'mute-everyone',
              'security'
            ],
            SETTINGS_SECTIONS: ['devices', 'language', 'moderator', 'profile', 'calendar'],
            SHOW_JITSI_WATERMARK: false,
            SHOW_WATERMARK_FOR_GUESTS: false,
            SHOW_BRAND_WATERMARK: false,
            SHOW_POWERED_BY: false,
            DISPLAY_WELCOME_PAGE_CONTENT: false,
            DISPLAY_WELCOME_PAGE_TOOLBAR_ADDITIONAL_CONTENT: false,
            SHOW_CHROME_EXTENSION_BANNER: false,
            MOBILE_APP_PROMO: false,
            NATIVE_APP_NAME: 'Doctaba',
            PROVIDER_NAME: 'Doctaba',
            LANG_DETECTION: true,
            CONNECTION_INDICATOR_AUTO_HIDE_ENABLED: true,
            CONNECTION_INDICATOR_AUTO_HIDE_TIMEOUT: 5000,
            CONNECTION_INDICATOR_DISABLED: false,
            VIDEO_LAYOUT_FIT: 'both',
            filmStripOnly: false,
            VERTICAL_FILMSTRIP: true,
          }
        });

        // Event listeners for better integration
        api.addEventListener('readyToClose', () => {
          handleEndCall();
        });

        api.addEventListener('participantJoined', (participant: any) => {
          setParticipants(prev => [...prev, participant]);
        });

        api.addEventListener('participantLeft', (participant: any) => {
          setParticipants(prev => prev.filter(p => p.id !== participant.id));
        });



        api.addEventListener('incomingMessage', (data: any) => {
          setChatMessages(prev => [...prev, {
            id: Date.now(),
            sender: data.from,
            message: data.message,
            timestamp: new Date()
          }]);
        });

        jitsiApiRef.current = api;
        setJitsiLoaded(true);

      } catch (error) {
        console.error('Failed to initialize Jitsi:', error);
      }
    };

    initJitsi();

    return () => {
      mounted = false;
      if (jitsiApiRef.current) {
        try {
          jitsiApiRef.current.dispose();
        } catch (e) {
          // Ignore dispose errors
        }
        jitsiApiRef.current = null;
      }
    };
  }, [appointmentId]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };



  const inviteParticipant = () => {
    const meetingLink = `${window.location.origin}/video-call/${appointmentId}`;
    navigator.clipboard.writeText(meetingLink);
    alert('Meeting link copied to clipboard!');
  };

  const muteParticipant = (participantId: string) => {
    if (jitsiApiRef.current) {
      jitsiApiRef.current.executeCommand('muteEveryone');
    }
  };

  const sendChatMessage = () => {
    if (jitsiApiRef.current && newMessage.trim()) {
      jitsiApiRef.current.executeCommand('sendChatMessage', newMessage);
      setNewMessage('');
    }
  };

  const handleEndCall = () => {
    if (jitsiApiRef.current) {
      try {
        jitsiApiRef.current.dispose();
      } catch (e) {
        // Ignore dispose errors
      }
      jitsiApiRef.current = null;
    }
    onEndCall();
    setLocation('/appointments');
  };

  return (
    <div className="h-screen bg-gray-900 flex flex-col">
      {/* Top Bar */}
      <div className="bg-gray-800 text-white p-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">In Call</span>
          </div>
          <span className="text-sm text-gray-300">{formatDuration(callDuration)}</span>
        </div>
        
        <div className="text-center">
          <h1 className="text-lg font-semibold">Video Consultation</h1>
          <p className="text-sm text-gray-300">Appointment #{appointmentId}</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowParticipants(!showParticipants)}
            className={`p-2 rounded-lg transition-colors ${
              showParticipants ? 'bg-cyan-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
            title="Participants"
          >
            <Users className="h-5 w-5" />
          </button>
          <button
            onClick={() => setShowChat(!showChat)}
            className={`p-2 rounded-lg transition-colors ${
              showChat ? 'bg-cyan-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
            title="Chat"
          >
            <MessageCircle className="h-5 w-5" />
          </button>
          <button
            onClick={() => setShowNotes(!showNotes)}
            className={`p-2 rounded-lg transition-colors ${
              showNotes ? 'bg-cyan-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
            title="Notes"
          >
            <FileText className="h-5 w-5" />
          </button>
          <button
            onClick={inviteParticipant}
            className="p-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors"
            title="Copy invite link"
          >
            <UserPlus className="h-5 w-5" />
          </button>
          <button
            onClick={handleEndCall}
            className="p-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors"
            title="End call"
          >
            <PhoneOff className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Video Container */}
        <div className="flex-1 relative">
          <div 
            ref={jitsiContainerRef}
            className="w-full h-full bg-gray-800"
          >
            {!jitsiLoaded && (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="w-32 h-32 bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="h-16 w-16 text-gray-400" />
                  </div>
                  <p className="text-lg font-medium">Loading Video Call...</p>
                  <p className="text-sm text-gray-400">Connecting to secure video conference</p>
                </div>
              </div>
            )}
          </div>


        </div>

        {/* Participants Sidebar */}
        {showParticipants && (
          <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Participants ({participants.length + 1})</h3>
              <p className="text-sm text-gray-600">Manage meeting participants</p>
            </div>
            
            <div className="flex-1 p-4 space-y-3">
              {/* Current user */}
              <div className="flex items-center justify-between p-3 bg-cyan-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-cyan-600 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-white">You</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">You (Host)</p>
                    <p className="text-xs text-gray-500">Present</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Volume2 className="h-4 w-4 text-green-600" />
                  <Camera className="h-4 w-4 text-green-600" />
                </div>
              </div>

              {/* Other participants */}
              {participants.map((participant, index) => (
                <div key={participant.id || index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-white">{participant.displayName?.[0] || 'P'}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{participant.displayName || 'Participant'}</p>
                      <p className="text-xs text-gray-500">Present</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => muteParticipant(participant.id)}
                      className="p-1 rounded-full bg-gray-200 hover:bg-gray-300"
                      title="Mute participant"
                    >
                      <MicOff className="h-3 w-3" />
                    </button>
                    <button className="p-1 rounded-full bg-gray-200 hover:bg-gray-300">
                      <MoreVertical className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))}

              {participants.length === 0 && (
                <div className="text-center py-8">
                  <Users className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Waiting for others</h3>
                  <p className="mt-1 text-sm text-gray-500">Share the meeting link to invite participants</p>
                  <button
                    onClick={inviteParticipant}
                    className="mt-3 inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-cyan-600 hover:bg-cyan-700"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Link
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Chat Sidebar */}
        {showChat && (
          <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Chat</h3>
              <p className="text-sm text-gray-600">Send messages to participants</p>
            </div>
            
            <div className="flex-1 p-4 overflow-y-auto">
              <div className="space-y-3">
                {chatMessages.map((message) => (
                  <div key={message.id} className="flex flex-col space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-medium text-gray-900">{message.sender}</span>
                      <span className="text-xs text-gray-500">{message.timestamp.toLocaleTimeString()}</span>
                    </div>
                    <div className="bg-gray-100 rounded-lg p-2">
                      <p className="text-sm text-gray-800">{message.message}</p>
                    </div>
                  </div>
                ))}
                
                {chatMessages.length === 0 && (
                  <div className="text-center py-8">
                    <MessageCircle className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No messages yet</h3>
                    <p className="mt-1 text-sm text-gray-500">Start a conversation with participants</p>
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 border-t border-gray-200">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  placeholder="Type a message..."
                />
                <button
                  onClick={sendChatMessage}
                  disabled={!newMessage.trim()}
                  className="px-3 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Notes Panel */}
        {showNotes && (
          <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Call Notes</h3>
              <p className="text-sm text-gray-600">Take notes during your consultation</p>
            </div>
            
            <div className="flex-1 p-4">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full h-full resize-none border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                placeholder="Type your notes here..."
              />
            </div>
            
            <div className="p-4 border-t border-gray-200">
              <button className="w-full bg-cyan-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-cyan-700 transition-colors">
                Save Notes
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}