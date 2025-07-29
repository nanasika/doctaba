import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Phone, 
  Settings, 
  Monitor, 
  MessageSquare,
  Users,
  FileText,
  Volume2,
  VolumeX
} from 'lucide-react';

// Jitsi Meet External API interface
declare global {
  interface Window {
    JitsiMeetExternalAPI: any;
  }
}

interface VideoCallPageProps {
  appointmentId: string;
  doctorName: string;
  onEndCall: () => void;
}

export default function VideoCallPage({ appointmentId, doctorName, onEndCall }: VideoCallPageProps) {
  const [, setLocation] = useLocation();
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isSpeakerOff, setIsSpeakerOff] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState('');
  const [callDuration, setCallDuration] = useState(0);
  const [jitsiApi, setJitsiApi] = useState<any>(null);
  const jitsiContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Load Jitsi Meet External API
    const loadJitsiScript = () => {
      return new Promise((resolve, reject) => {
        if (window.JitsiMeetExternalAPI) {
          resolve(window.JitsiMeetExternalAPI);
          return;
        }

        const script = document.createElement('script');
        script.src = 'https://meet.jit.si/external_api.js';
        script.onload = () => resolve(window.JitsiMeetExternalAPI);
        script.onerror = reject;
        document.head.appendChild(script);
      });
    };

    const initializeJitsi = async () => {
      try {
        await loadJitsiScript();
        
        if (jitsiContainerRef.current && window.JitsiMeetExternalAPI) {
          const roomName = `doctaba-appointment-${appointmentId}`;
          
          // Completely clear any existing Jitsi instances
          if (jitsiApi) {
            try {
              jitsiApi.dispose();
            } catch (error) {
              console.log('Error disposing existing API:', error);
            }
            setJitsiApi(null);
          }
          
          // Create a completely fresh container to avoid DOM conflicts
          if (jitsiContainerRef.current) {
            // Simply clear the existing container safely
            try {
              jitsiContainerRef.current.innerHTML = '';
            } catch (e) {
              console.log('Error clearing container:', e);
            }
          }
          
          // Add a small delay to ensure DOM is ready
          await new Promise(resolve => setTimeout(resolve, 300));
          
          // Ensure we have a clean container before creating Jitsi
          if (!jitsiContainerRef.current) {
            console.error('Container ref is not available');
            return;
          }

          const api = new window.JitsiMeetExternalAPI('meet.jit.si', {
            roomName: roomName,
            parentNode: jitsiContainerRef.current,
            width: '100%',
            height: '100%',
            configOverwrite: {
              prejoinPageEnabled: false,
              startWithAudioMuted: false,
              startWithVideoMuted: false,
              disableDeepLinking: true,
              startScreenSharing: false,
              enableWelcomePage: false,
              enableClosePage: false,
              disableProfile: true,
              enableUserRolesBasedOnToken: false,
              enableFeaturesBasedOnToken: false,
              disableInviteFunctions: true,
              doNotStoreRoom: true,
              // More aggressive settings to prevent duplicates
              disableFilmstripAutohiding: true,
              filmstrip: {
                disabled: true,
                disableResizable: true,
                disableStageFilmstrip: true,
              },
              // Disable all views that could cause duplicates
              disableTileView: true,
              disableSelfView: false, // Keep self view enabled but control via interface
              disableSelfViewSettings: true,
              // Single stream configuration
              enableLayerSuspension: false,
              channelLastN: 1,
              // Prevent video mirroring and multiple streams
              localVideoMirroredPreview: false,
              // Disable automatic video quality adjustments
              disableAV: false,
              // Force single participant view
              startInSilentMode: false,
            },
            interfaceConfigOverwrite: {
              HIDE_INVITE_MORE_HEADER: true,
              DISABLE_DOMINANT_SPEAKER_INDICATOR: true,
              DISABLE_FOCUS_INDICATOR: true,
              DISABLE_TRANSCRIPTION_SUBTITLES: true,
              SHOW_CHROME_EXTENSION_BANNER: false,
              TOOLBAR_BUTTONS: [
                'microphone', 'camera', 'hangup', 'desktop', 'fullscreen',
                'fodeviceselection', 'settings'
              ],
              TOOLBAR_ALWAYS_VISIBLE: true,
              DEFAULT_BACKGROUND: '#040404',
              DISABLE_VIDEO_BACKGROUND: false,
              ENABLE_DIAL_OUT: false,
              ENABLE_FEEDBACK_ANIMATION: false,
              // Aggressively disable filmstrip
              FILMSTRIP_ENABLED: false,
              GENERATE_ROOMNAMES_ON_WELCOME_PAGE: false,
              HIDE_DEEP_LINKING_LOGO: true,
              JITSI_WATERMARK_LINK: '',
              LANG_DETECTION: false,
              LIVE_STREAMING_ENABLED: false,
              MOBILE_APP_PROMO: false,
              NATIVE_APP_NAME: 'Doctaba',
              PROVIDER_NAME: 'Doctaba',
              RECENT_LIST_ENABLED: false,
              SETTINGS_SECTIONS: ['devices'],
              SHOW_JITSI_WATERMARK: false,
              SHOW_WATERMARK_FOR_GUESTS: false,
              SHOW_BRAND_WATERMARK: false,
              SHOW_POWERED_BY: false,
              // Complete disable of all duplicate-causing features
              DISABLE_TILE_VIEW: true,
              VERTICAL_FILMSTRIP: false,
              FILM_STRIP_MAX_HEIGHT: 0,
              // Additional aggressive settings
              INITIAL_TOOLBAR_TIMEOUT: 20000,
              TOOLBAR_TIMEOUT: 4000,
              // Force single view mode
              DISABLE_SELF_VIEW_SETTINGS: true,
            },
          });

          api.addEventListener('readyToClose', () => {
            handleEndCall();
          });

          api.addEventListener('audioMuteStatusChanged', (event: any) => {
            setIsMuted(event.muted);
          });

          api.addEventListener('videoMuteStatusChanged', (event: any) => {
            setIsVideoOff(event.muted);
          });

          // Handle participant changes to manage display when alone
          api.addEventListener('participantJoined', (participant: any) => {
            console.log('Participant joined:', participant.displayName);
          });

          api.addEventListener('participantLeft', (participant: any) => {
            console.log('Participant left:', participant.displayName);
          });

          // Handle participants - keep filmstrip disabled always to prevent duplicates
          api.addEventListener('participantJoined', (participant: any) => {
            console.log('Participant joined:', participant.displayName);
            // Keep filmstrip disabled even when others join to prevent duplicate issues
            setTimeout(() => {
              try {
                api.executeCommand('setFilmstripVisible', false);
                console.log('Keeping filmstrip disabled to prevent duplicates');
              } catch (e) {
                console.log('Filmstrip command not available');
              }
            }, 500);
          });

          api.addEventListener('participantLeft', (participant: any) => {
            console.log('Participant left:', participant.displayName);
            // Ensure filmstrip stays disabled
            setTimeout(() => {
              try {
                api.executeCommand('setFilmstripVisible', false);
              } catch (e) {
                console.log('Filmstrip command not available');
              }
            }, 500);
          });

          // Handle when conference is ready
          api.addEventListener('videoConferenceJoined', (data: any) => {
            console.log('Conference joined:', data);
            // Aggressively disable all duplicate-causing features
            setTimeout(() => {
              try {
                api.executeCommand('setFilmstripVisible', false);
                api.executeCommand('setTileView', false);
                api.executeCommand('toggleFilmstrip');
                console.log('Aggressively disabled all duplicate views');
              } catch (e) {
                console.log('Could not execute view commands');
              }
            }, 100);
            
            // Double-check after a longer delay
            setTimeout(() => {
              try {
                api.executeCommand('setFilmstripVisible', false);
                api.executeCommand('setTileView', false);
              } catch (e) {
                console.log('Second attempt at disabling views failed');
              }
            }, 1000);
          });

          setJitsiApi(api);
        }
      } catch (error) {
        console.error('Failed to load Jitsi Meet:', error);
        // Reset the container if initialization fails
        if (jitsiContainerRef.current) {
          jitsiContainerRef.current.innerHTML = `
            <div class="w-full h-full bg-gray-800 flex items-center justify-center">
              <div class="text-center text-white">
                <p class="text-lg font-medium text-red-400">Video Call Failed to Load</p>
                <p class="text-sm text-gray-400">Please refresh the page to try again</p>
              </div>
            </div>
          `;
        }
      }
    };

    initializeJitsi();

    return () => {
      if (jitsiApi) {
        try {
          jitsiApi.dispose();
        } catch (e) {
          console.log('Error disposing Jitsi API:', e);
        }
        setJitsiApi(null);
      }
    };
  }, [appointmentId]);

  const toggleMute = () => {
    if (jitsiApi) {
      jitsiApi.executeCommand('toggleAudio');
    }
  };

  const toggleVideo = () => {
    if (jitsiApi) {
      jitsiApi.executeCommand('toggleVideo');
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEndCall = () => {
    if (jitsiApi) {
      try {
        jitsiApi.dispose();
      } catch (e) {
        console.log('Error disposing Jitsi API on end call:', e);
      }
      setJitsiApi(null);
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
            onClick={() => setShowNotes(!showNotes)}
            className={`p-2 rounded-lg transition-colors ${
              showNotes ? 'bg-cyan-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <FileText className="h-5 w-5" />
          </button>
          <button
            onClick={handleEndCall}
            className="p-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors"
          >
            <Phone className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Jitsi Video Container */}
        <div className="flex-1 relative">
          <div 
            id={`jitsi-container-${appointmentId}`}
            ref={jitsiContainerRef}
            className="w-full h-full"
            style={{ minHeight: '500px', overflow: 'hidden' }}
          >
            {!jitsiApi && (
              <div className="w-full h-full bg-gray-800 flex items-center justify-center">
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