export interface User {
  id: string;
  name: string;
  age: string;
  gender: string;
  country: string;
}

export interface ChatMessage {
  id: number;
  text: string;
  timestamp: Date;
  sender: User;
}

export interface VideoCallState {
  isActive: boolean;
  isMuted: boolean;
  isCameraOn: boolean;
  isScreenSharing: boolean;
}

export type GenderOption = {
  value: string;
  label: string;
};