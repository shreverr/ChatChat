'use client'
import { useEffect, useState, useRef } from 'react';
import { VideoCallReturns } from '@/lib/videoCallReturns';

export default function Home() {
  const [isRegistered, setIsRegistered] = useState(false);
  const [messages, setMessages] = useState<{ from: string; message: string }[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [currentPeer, setCurrentPeer] = useState<any>(null);
  const [status, setStatus] = useState('');
  const videoCallRef = useRef<VideoCallReturns>(new VideoCallReturns());

  useEffect(() => {
    // Connection state
    videoCallRef.current.on('connectionState', (data) => {
      switch (data.state) {
        case 'connected':
          setStatus('Connected to server');
          break;
        case 'error':
          setStatus(`Connection error: ${data.message}`);
          break;
        case 'disconnected':
          setStatus('Disconnected from server');
          break;
      }
    });

    // Match state
    videoCallRef.current.on('matchState', (data) => {
      switch (data.state) {
        case 'searching':
          setStatus(data.message);
          break;
        case 'waiting':
          setStatus(data.message);
          break;
        case 'matched':
          setCurrentPeer(data.peer);
          setStatus('Match found!');
          break;
        case 'disconnected':
          setStatus(data.message);
          setCurrentPeer(null);
          setMessages([]);
          break;
        case 'error':
          setStatus(`Match error: ${data.message}`);
          break;
      }
    });

    // Call state
    videoCallRef.current.on('callState', (data) => {
      switch (data.state) {
        case 'connecting':
          setStatus('Connecting call...');
          break;
        case 'connected':
          setStatus('Call connected');
          break;
        case 'ended':
          setStatus('Call ended');
          break;
        case 'error':
          setStatus(`Call error: ${data.message}`);
          break;
      }
    });

    // Message handling
    videoCallRef.current.on('message', (data) => {
      setMessages((prev) => [...prev, data]);
    });

    return () => {
      videoCallRef.current.disconnect();
    };
  }, []);

  const handleRegister = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    videoCallRef.current.register({
      fullName: formData.get('fullName') as string,
      age: formData.get('age') as string,
      gender: formData.get('gender') as string,
    });
    setIsRegistered(true);
  };

  const handleFindMatch = () => {
    videoCallRef.current.findMatch();
  };

  const handleSendMessage = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (currentPeer && currentMessage.trim()) {
      videoCallRef.current.sendMessage(currentPeer.id, currentMessage);
      setMessages((prev) => [...prev, { from: 'me', message: currentMessage }]);
      setCurrentMessage('');
    }
  };

  return (
    <div className="min-h-screen p-4">
      {/* Status display */}
      {status && (
        <div className="max-w-4xl mx-auto mb-4 p-2 bg-blue-100 rounded text-center">
          {status}
        </div>
      )}

      {!isRegistered ? (
        <form onSubmit={handleRegister} className="max-w-md mx-auto space-y-4">
          <input
            name="fullName"
            placeholder="Full Name"
            required
            className="w-full p-2 border rounded"
          />
          <input
            name="age"
            placeholder="Age"
            required
            className="w-full p-2 border rounded"
          />
          <select name="gender" required className="w-full p-2 border rounded">
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
          <button type="submit" className="w-full p-2 bg-blue-500 text-white rounded">
            Register
          </button>
        </form>
      ) : (
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <video id="localVideo" autoPlay playsInline muted className="w-full bg-gray-200" />
            <video id="remoteVideo" autoPlay playsInline className="w-full bg-gray-200" />
          </div>

          {!currentPeer ? (
            <button
              onClick={handleFindMatch}
              className="w-full p-2 bg-green-500 text-white rounded"
            >
              Find Match
            </button>
          ) : (
            <div className="space-y-4">
              <div className="p-4 border rounded">
                <h3 className="font-bold">Connected with: {currentPeer.fullName}</h3>
                <p>Age: {currentPeer.age}</p>
                <p>Gender: {currentPeer.gender}</p>
              </div>

              <div className="h-60 overflow-y-auto border rounded p-4">
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`mb-2 ${msg.from === 'me' ? 'text-right' : 'text-left'}`}
                  >
                    <span className="bg-gray-100 p-2 rounded inline-block">
                      {msg.message}
                    </span>
                  </div>
                ))}
              </div>

              <form onSubmit={handleSendMessage} className="flex gap-2">
                <input
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 p-2 border rounded"
                />
                <button type="submit" className="p-2 bg-blue-500 text-white rounded">
                  Send
                </button>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
}