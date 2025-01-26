import { useState, useCallback } from "react";
import { VideoCallState } from "@/types";

export const useVideoCall = () => {
  const [callState, setCallState] = useState<VideoCallState>({
    isActive: false,
    isMuted: false,
    isCameraOn: true,
    isScreenSharing: false,
  });

  const toggleMute = useCallback(() => {
    setCallState((prev) => ({
      ...prev,
      isMuted: !prev.isMuted,
    }));
  }, []);

  const toggleCamera = useCallback(() => {
    setCallState((prev) => ({
      ...prev,
      isCameraOn: !prev.isCameraOn,
    }));
  }, []);

  const toggleScreenShare = useCallback(() => {
    setCallState((prev) => ({
      ...prev,
      isScreenSharing: !prev.isScreenSharing,
    }));
  }, []);

  const startCall = useCallback(() => {
    setCallState((prev) => ({
      ...prev,
      isActive: true,
    }));
  }, []);

  const endCall = useCallback(() => {
    setCallState({
      isActive: false,
      isMuted: false,
      isCameraOn: true,
      isScreenSharing: false,
    });
  }, []);

  return {
    callState,
    toggleMute,
    toggleCamera,
    toggleScreenShare,
    startCall,
    endCall,
  };
};