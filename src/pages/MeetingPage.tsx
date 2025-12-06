import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import MeetingRoom from '../components/MeetingRoom';
import { createMeeting } from '../api/api';
import { MeetingResponse, Module } from '../types';

export default function MeetingPage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [meetingData, setMeetingData] = useState<MeetingResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const urlParams = new URLSearchParams(window.location.search);
  const moduleId = urlParams.get('moduleId');
  const module = location.state?.module as Module | undefined;

  const handleCreateMeeting = async () => {
    if (!moduleId || !currentUser) return;

    try {
      setIsLoading(true);
      setError(null);

      const data = await createMeeting(moduleId);
      
      if (!data) {
        throw new Error('Failed to create meeting');
      }

      setMeetingData(data);
    } catch (err: any) {
      setError(err.message || 'Failed to create meeting');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLeave = () => {
    setMeetingData(null);
    navigate(-1); // Go back to previous page
  };

  // If meeting data exists, show meeting room
  if (meetingData) {
    return (
      <MeetingRoom
        token={meetingData.token}
        roomName={meetingData.roomName}
        displayName={meetingData.displayName}
        email={meetingData.email}
        role={meetingData.role}
        onLeave={handleLeave}
      />
    );
  }

  // Show loading or error state
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Join Meeting</h1>
        
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {!moduleId ? (
          <div className="text-center">
            <p className="text-gray-600 mb-4">No module specified</p>
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Go Back
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg space-y-2">
              <p className="text-sm text-gray-600">
                <span className="font-medium">User:</span> {currentUser?.firstName} {currentUser?.lastName}
              </p>
              {module && (
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Module:</span> {module.name}
                </p>
              )}
            </div>

            <button
              onClick={handleCreateMeeting}
              disabled={isLoading}
              className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Connecting...
                </span>
              ) : (
                currentUser?.role === 'LECTURER' ? 'Start Meeting' : 'Join Meeting'
              )}
            </button>

            <button
              onClick={() => navigate(-1)}
              className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
