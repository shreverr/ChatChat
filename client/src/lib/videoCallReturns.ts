'use client'

import { Socket, io } from 'socket.io-client';
import Peer, { MediaConnection } from 'peerjs';

interface User {
  id: string;
  fullName: string;
  age: string;
  gender: string;
}

type CallbackFunction = (...args: any[]) => void;

export class VideoCallReturns {
  private socket: Socket;
  private peer: Peer;
  private currentCall?: MediaConnection;
  private eventListeners: Map<string, CallbackFunction[]> = new Map();
  private maxReconnectAttempts = 5;
  
  constructor() {
    this.socket = io('http://192.168.56.1:3001', {
      transports: ['websocket'],
      path: '/socket.io/',
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000
    });

    this.peer = new Peer();
    
    // Setup socket event listeners
    this.setupSocketListeners();
    
    // Setup peer event listeners
    this.setupPeerListeners();
  }

  private setupSocketListeners() {
    this.socket.on('connect', () => {
      this.emit('connectionState', { state: 'connected' });
    });

    this.socket.on('connect_error', (error) => {
      this.emit('connectionState', { 
        state: 'error', 
        message: 'Failed to connect to server' 
      });
    });

    this.socket.on('waitingForMatch', () => {
      this.emit('matchState', { 
        state: 'waiting',
        message: 'Looking for a match...' 
      });
    });

    this.socket.on('matchError', (data) => {
      this.emit('matchState', { 
        state: 'error',
        message: data.message 
      });
    });

    this.socket.on('match', (data) => {
      this.emit('matchState', { 
        state: 'matched',
        peer: data.peer 
      });
    });

    this.socket.on('peerDisconnected', () => {
      this.emit('matchState', { 
        state: 'disconnected',
        message: 'Your peer has disconnected' 
      });
    });

    this.socket.on('message', (data) => {
      this.emit('message', data);
    });
  }

  private setupPeerListeners() {
    this.peer.on('open', (id) => {
      console.log('Peer created id:', id);
      
      this.emit('peerState', { 
        state: 'ready',
        peerId: id 
      });
    });

    this.peer.on('error', (error) => {
      this.emit('peerState', { 
        state: 'error',
        message: 'Peer connection error' 
      });
    });

    this.peer.on('call', (call) => {
      this.emit('callState', { state: 'incoming' });
      
      navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then((stream) => {
          call.answer(stream);
          this.handleStream(call);
          this.emit('callState', { 
            state: 'connected',
            stream 
          });
        })
        .catch((err) => {
          this.emit('callState', { 
            state: 'error',
            message: 'Failed to get local stream' 
          });
        });
    });
  }

  private handleStream(call: MediaConnection) {
    call.on('stream', (remoteStream) => {
      const remoteVideo = document.getElementById('remoteVideo') as HTMLVideoElement;
      if (remoteVideo) {
        remoteVideo.srcObject = remoteStream;
        this.emit('remoteStream', { stream: remoteStream });
      }
    });

    call.on('close', () => {
      this.emit('callState', { state: 'ended' });
      this.endCall();
    });

    this.currentCall = call;
  }

  async startCall(remotePeerId: string) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      const localVideo = document.getElementById('localVideo') as HTMLVideoElement;
      if (localVideo) {
        localVideo.srcObject = stream;
        this.emit('localStream', { stream });
      }

      const call = this.peer.call(remotePeerId, stream);
      this.handleStream(call);
      this.emit('callState', { state: 'connecting' });
    } catch (err) {
      this.emit('callState', { 
        state: 'error',
        message: 'Failed to start call' 
      });
    }
  }

  endCall() {
    if (this.currentCall) {
      this.currentCall.close();
      this.currentCall = undefined;
    }

    const localVideo = document.getElementById('localVideo') as HTMLVideoElement;
    const remoteVideo = document.getElementById('remoteVideo') as HTMLVideoElement;

    if (localVideo && localVideo.srcObject) {
      (localVideo.srcObject as MediaStream).getTracks().forEach(track => track.stop());
      localVideo.srcObject = null;
    }

    if (remoteVideo) {
      remoteVideo.srcObject = null;
    }

    this.emit('callState', { state: 'ended' });
  }

  register(userData: Omit<User, 'id' | 'isPaired'>) {
    this.socket.emit('register', userData);
    this.emit('registrationState', { 
      state: 'registered',
      userData 
    });
  }

  findMatch() {
    this.socket.emit('findMatch');
    this.emit('matchState', { 
      state: 'searching',
      message: 'Initiating match search...' 
    });
  }

  sendMessage(to: string, message: string) {
    this.socket.emit('message', { to, message });
    this.emit('messageSent', { to, message });
  }

  // Event handling methods
  on(event: string, callback: CallbackFunction) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)?.push(callback);
  }

  off(event: string, callback: CallbackFunction) {
    const callbacks = this.eventListeners.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index !== -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  private emit(event: string, data: any) {
    const callbacks = this.eventListeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }

  disconnect() {
    this.endCall();
    this.socket.disconnect();
    this.peer.destroy();
    this.emit('connectionState', { state: 'disconnected' });
  }
}