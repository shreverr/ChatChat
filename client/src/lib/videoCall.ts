import { Peer } from "peerjs";
import { io, Socket } from "socket.io-client";

type User = {
  id: string;
  fullName: string;
  age: string;
  gender: string;
  isPaired: boolean;
}

type UserData = {
  fullName: string;
  age: string;
  gender: string;
}

export class VideoCall {
  private peer: Peer;
  private mediaStream: MediaStream;
  private peerId: string | null = null;
  public remoteStream: MediaStream | null = null;
  private socket: Socket;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private isPeerReady = false;
  private isSocketReady = false;
  private userData: UserData;
  public onUserRegistered?: (user: User) => void;
  public onMatchFound?: (user: User) => void;

  constructor(mediaStream: MediaStream, userData: UserData) {
    this.mediaStream = mediaStream;
    this.userData = userData;
    this.peer = new Peer();
    
    this.socket = io('http://localhost:3001', {
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: 1000,
      timeout: 10000,
      transports: ['websocket', 'polling']
    });

    this.initializePeerEvents();
    this.initializeSocketEvents();
  }

  private checkAndRegister() {
    if (this.isPeerReady && this.isSocketReady) {
      this.socket.emit('register', {
        fullName: this.userData.fullName,
        age: this.userData.age,
        gender: this.userData.gender
      });
      console.log('Registration request sent with data:', this.userData);
    }
  }

  private initializePeerEvents() {
    this.peer.on("open", (id) => {
      console.log("Peer created id: ", id);
      this.peerId = id;
      this.isPeerReady = true;
      this.checkAndRegister();
    });

    this.peer.on("error", (error) => {
      console.error("PeerJS error:", error);
    });

    this.peer.on("call", (call) => {
      call.answer(this.mediaStream);
      call.on("stream", (remoteStream) => {
        this.remoteStream = remoteStream;
        // Notify any UI listeners that we have a remote stream
        if (this.onMatchFound) {
          // Note: We don't have the matched user data here, 
          // but we'll get it from the 'match' socket event
        }
      });
    });
  }

  private initializeSocketEvents() {
    this.socket.on("connect", () => {
      console.log("Socket connected successfully");
      this.reconnectAttempts = 0;
      this.isSocketReady = true;
      this.checkAndRegister();
    });

    this.socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
      this.reconnectAttempts++;
      this.isSocketReady = false;
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error("Max reconnection attempts reached");
        this.socket.disconnect();
      }
    });

    this.socket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
      this.isSocketReady = false;
    });

    // Listen for successful registration
    this.socket.on("registered", (user: User) => {
      console.log("Registration confirmed by server:", user);
      if (this.onUserRegistered) {
        this.onUserRegistered(user);
      }
    });

    this.socket.on("match", async (data: { matchedUser: User, peerId: string, doCall: boolean }) => {
      console.log("Match found:", data.matchedUser);
      try {
        if (data.doCall) {
          this.remoteStream = await this.callPeer(data.peerId);
        }
        if (this.onMatchFound) {
          this.onMatchFound(data.matchedUser);
        }
      } catch (error) {
        console.error("Error during match handling:", error);
      }
    });
  }

  public findMatch = (): void => {
    if (!this.socket.connected) {
      throw new Error("Socket is not connected");
    }

    console.log("Requesting match...");
    this.socket.emit("findMatch", this.socket.id);
  }

  public getPeerId = (): string | null => {
    if (!this.peerId) {
      throw new Error("Peer ID is not available yet");
    }
    return this.peerId;
  }

  public callPeer = (peerId: string): Promise<MediaStream> => {
    if (!this.peerId) {
      throw new Error("Peer ID is not available yet");
    }

    return new Promise((resolve, reject) => {
      try {
        const call = this.peer.call(peerId, this.mediaStream);
        call.on("stream", (remoteStream) => {
          resolve(remoteStream);
        });
        call.on("error", (error) => {
          reject(error);
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  public disconnect = () => {
    this.socket.disconnect();
    this.peer.destroy();
  }
}