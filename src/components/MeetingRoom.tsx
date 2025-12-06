import { useEffect, useRef, useState } from 'react';

interface MeetingRoomProps {
  token: string;
  roomName: string;
  displayName: string;
  email: string;
  role: 'LECTURER' | 'STUDENT';
  onLeave: () => void;
}

declare global {
  interface Window {
    JitsiMeetExternalAPI: any;
  }
}

export default function MeetingRoom({
  token,
  roomName,
  displayName,
  email,
  role,
  onLeave
}: MeetingRoomProps) {
  const jitsiContainerRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<any>(null);
  const isInitializing = useRef(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isLecturer = role === 'LECTURER';
  const jitsiDomain = 'jit.shancloudservice.com';

  useEffect(() => {
    // Prevent duplicate initialization
    if (isInitializing.current || apiRef.current) {
      return;
    }
    isInitializing.current = true;

    const loadJitsiScript = () => {
      return new Promise((resolve, reject) => {
        if (window.JitsiMeetExternalAPI) {
          resolve(window.JitsiMeetExternalAPI);
          return;
        }

        const script = document.createElement('script');
        script.src = `https://${jitsiDomain}/external_api.js`;
        script.async = true;
        script.onload = () => resolve(window.JitsiMeetExternalAPI);
        script.onerror = () => reject(new Error('Failed to load Jitsi API'));
        document.head.appendChild(script);
      });
    };

    const initializeJitsi = async () => {
      try {
        setIsLoading(true);
        await loadJitsiScript();

        if (!jitsiContainerRef.current) return;

        // Prevent multiple initializations
        if (apiRef.current) {
          apiRef.current.dispose();
          apiRef.current = null;
        }

        const options = {
          roomName: roomName,
          width: '100%',
          height: '100%',
          parentNode: jitsiContainerRef.current,
          jwt: token,
          userInfo: {
            displayName: displayName,
            email: email,
          },
          configOverwrite: {
            startWithAudioMuted: true,
            startWithVideoMuted: true,
            prejoinPageEnabled: false,
            disableDeepLinking: true,
            
            // Lecturer permissions
            ...(isLecturer && {
              enableRecording: true,
              enableLiveStreaming: true,
              enableKickParticipants: true,
              enableMuteAll: true,
            }),
            
            // Student restrictions
            ...(!isLecturer && {
              enableRecording: false,
              enableLiveStreaming: false,
              enableKickParticipants: false,
              enableMuteAll: false,
            }),
          },
          interfaceConfigOverwrite: {
            TOOLBAR_BUTTONS: isLecturer ? [
              'microphone', 'camera', 'desktop', 'fullscreen',
              'fodeviceselection', 'hangup', 'chat', 'recording',
              'settings', 'raisehand', 'videoquality', 'filmstrip',
              'participants-pane', 'tileview'
            ] : [
              'microphone', 'camera', 'fullscreen',
              'fodeviceselection', 'hangup', 'chat',
              'settings', 'raisehand', 'filmstrip', 'tileview'
            ],
            DISABLE_JOIN_LEAVE_NOTIFICATIONS: false,
            SHOW_JITSI_WATERMARK: false,
            SHOW_WATERMARK_FOR_GUESTS: false,
            FILM_STRIP_MAX_HEIGHT: 120,
            VERTICAL_FILMSTRIP: false,
          },
        };

        apiRef.current = new window.JitsiMeetExternalAPI(jitsiDomain, options);

        apiRef.current.addEventListener('ready', () => {
          setIsLoading(false);
        });

        apiRef.current.addEventListener('videoConferenceLeft', () => {
          onLeave();
        });

      } catch (err: any) {
        setError(err.message || 'Failed to load meeting');
        setIsLoading(false);
        isInitializing.current = false;
      }
    };

    initializeJitsi();

    return () => {
      isInitializing.current = false;
      if (apiRef.current) {
        apiRef.current.dispose();
        apiRef.current = null;
      }
    };
  }, [token, roomName, displayName, email, isLecturer, onLeave]);

  return (
    <div className="h-screen w-screen flex flex-col bg-gray-900">
      <div className="bg-white border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-lg font-semibold">{roomName}</h1>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            isLecturer 
              ? 'bg-green-100 text-green-700' 
              : 'bg-blue-100 text-blue-700'
          }`}>
            {isLecturer ? 'LECTURER' : 'STUDENT'}
          </span>
        </div>
        <button
          onClick={onLeave}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
        >
          Leave Meeting
        </button>
      </div>
      
      <div className="flex-1 relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
            <div className="text-center text-white">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
              <p>Loading meeting...</p>
            </div>
          </div>
        )}
        
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
            <div className="text-center text-white">
              <p className="text-red-400 mb-4">{error}</p>
              <button
                onClick={onLeave}
                className="px-4 py-2 bg-white text-gray-900 rounded-lg hover:bg-gray-100"
              >
                Go Back
              </button>
            </div>
          </div>
        )}
        
        <div 
          ref={jitsiContainerRef} 
          className="w-full h-full"
        />
      </div>
    </div>
  );
}
