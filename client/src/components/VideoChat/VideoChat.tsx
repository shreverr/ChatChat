import { VideoCall } from "@/lib/videoCall";
import React, { useState, useEffect, useRef } from "react";
import {
  RiMapPinLine,
  RiSkipRightLine,
  RiGooglePlayLine,
  RiSendPlaneFill,
} from "react-icons/ri";
import { FC } from 'react'
import { FormData } from "../Form";

interface ChatMessage {
  id: number;
  text: string;
  timestamp: Date;
}

interface VideoChatProps {
  userData: FormData | null,
}

const VideoChat: FC<VideoChatProps> = ({ userData }) => {
  const name = userData?.fullName || "";
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("");
  const country = "IN";
  const age = userData?.age ||"";
  const gender = userData?.sex || "";
  const [message, setMessage] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null); // Ref for the local camera stream video element
  const remoteVideoRef = useRef<HTMLVideoElement>(null); // Ref for the remote video stream video element

  let vid: VideoCall 

  const getGenderInitial = (gender: string) => {
    switch (gender.toLowerCase()) {
      case "male":
        return "M";
      case "female":
        return "F";
      default:
        return "O";
    }
  };

  const handleSendMessage = () => {
    if (message.trim()) {
      const newMessage: ChatMessage = {
        id: Date.now(),
        text: message.trim(),
        timestamp: new Date(),
      };
      setChatMessages((prev) => [...prev, newMessage].slice(-5));
      setMessage("");
    }
  };

  // Scroll to the bottom of the chat container when new messages are added
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  // Access the user's camera and display the stream
  useEffect(() => {
    const enableCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
        vid = new VideoCall(stream, { fullName: 'shreshth', age: '20', gender: 'male'});

        // Assuming `vid.remoteStream` is a MediaStream object
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = vid.remoteStream;
        }
      } catch (error) {
        console.error("Error accessing the camera:", error);
      }
    };

    enableCamera();

    // Cleanup function to stop the camera stream when the component unmounts
    return () => {
      if (localVideoRef.current && localVideoRef.current.srcObject) {
        const stream = localVideoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
      if (remoteVideoRef.current && remoteVideoRef.current.srcObject) {
        const stream = remoteVideoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return (
    <div className="w-full h-full flex flex-col lg:flex-row p-0">
      {/* Upper Half (Left on Desktop) */}
      <div className="w-full lg:w-1/2 relative">
        {/* Camera stream video element */}
        <video
          ref={localVideoRef}
          autoPlay
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover z-0 opacity-100 rounded-l-lg md:rounded-l-xl"
        ></video>
        <div className="relative z-10 p-4 sm:p-6">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#FF6B6B] border-2 border-black shadow-[4px_4px_0_0_black] flex items-center justify-center font-bold text-lg sm:text-xl text-white">
                {initials}
              </div>
              <span className="text-[#FFE66D] font-black text-xl sm:text-2xl drop-shadow-[2px_2px_0_rgba(0,0,0,0.9)]">
                {name}
              </span>
            </div>
            <div className="flex items-center gap-2 bg-[#4ECDC4] px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg border-2 border-black shadow-[4px_4px_0_0_black]">
              <RiMapPinLine className="text-lg sm:text-xl text-black" />
              <span className="font-black text-black text-sm sm:text-base">
                {country}
              </span>
            </div>
          </div>
        </div>
        {/* Buttons at the bottom of the first half */}
        <div className="absolute bottom-4 sm:bottom-6 left-4 sm:left-6 right-4 sm:right-6 flex gap-3 sm:gap-4">
          <button className="flex-1 px-4 sm:px-6 py-2 sm:py-3 bg-[#FF6B6B] text-white font-black rounded-lg border-2 border-black shadow-[4px_4px_0_0_black] hover:shadow-[2px_2px_0_0_black] active:shadow-none transition-shadow flex items-center justify-center sm:justify-start gap-2 hover:bg-[#FF5252]">
            <RiGooglePlayLine className="text-lg sm:text-xl" />
            Download APK
          </button>
          <button className="flex-1 px-4 sm:px-6 py-2 sm:py-3 bg-[#FFE66D] text-black font-black rounded-lg border-2 border-black shadow-[4px_4px_0_0_black] hover:shadow-[2px_2px_0_0_black] active:shadow-none transition-shadow flex items-center justify-center sm:justify-start gap-2 hover:bg-[#FFD93D]">
            Skip
            <RiSkipRightLine className="text-lg sm:text-xl" />
          </button>
        </div>
      </div>
      {/* Divider */}
      <div className="w-full h-1 lg:w-1 lg:h-full bg-white border-2 border-white my-0 lg:my-0 lg:mx-0"></div>
      {/* Lower Half (Right on Desktop) */}
      <div className="w-full lg:w-1/2 relative">
        {/* Video background for the right half */}
        <video
          ref={remoteVideoRef}
          autoPlay
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover z-0 opacity-100 rounded-r-lg md:rounded-r-xl"
        ></video>
        <div className="relative z-10 p-4 sm:p-6">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#FF6B6B] border-2 border-black shadow-[4px_4px_0_0_black] flex items-center justify-center font-bold text-lg sm:text-xl text-white">
                {initials}
              </div>
              <span className="text-[#FFE66D] font-black text-xl sm:text-2xl drop-shadow-[2px_2px_0_rgba(0,0,0,0.9)]">
                {name}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#4ECDC4] border-2 border-black shadow-[4px_4px_0_0_black] flex items-center justify-center font-bold text-lg sm:text-xl text-black">
                {getGenderInitial(gender)}
              </div>
              <span className="text-[#FFE66D] font-black text-xl sm:text-2xl drop-shadow-[2px_2px_0_rgba(0,0,0,0.9)]">
                {age}
              </span>
            </div>
          </div>
        </div>
        {/* Chat messages container */}
        <div
          ref={chatContainerRef} // Attach the ref to the chat container
          className="flex flex-col items-baseline justify-end absolute bottom-20 sm:bottom-24 left-4 sm:left-6 right-4 sm:right-6 h-48 min-h-[12rem] overflow-y-auto"
        >
          <div className="flex w-full flex-col gap-3 pb-2">
            {chatMessages.map((msg) => (
              <div key={msg.id} className="flex">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#FF6B6B] border-2 border-black shadow-[2px_2px_0_0_black] flex items-center justify-center font-bold text-sm sm:text-base text-white">
                    {initials}
                  </div>
                  <div className="flex-1 p-2 sm:p-3 bg-white rounded-lg border-2 border-black shadow-[2px_2px_0_0_black]">
                    <p className="text-sm sm:text-black font-bold">
                      {msg.text}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Input and Send button at the bottom of the right half */}
        <div className="absolute bottom-4 sm:bottom-6 left-4 sm:left-6 right-4 sm:right-6 flex gap-3 sm:gap-4">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            placeholder="Type your message..."
            className="flex-1 px-3 sm:px-4 py-2 sm:py-3 bg-white text-black font-bold text-sm sm:text-base rounded-lg border-2 border-black shadow-[4px_4px_0_0_black] focus:outline-none focus:shadow-[2px_2px_0_0_black] transition-shadow"
          />
          <button
            onClick={handleSendMessage}
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#FF6B6B] text-white border-2 border-black shadow-[4px_4px_0_0_black] hover:shadow-[2px_2px_0_0_black] active:shadow-none transition-shadow flex items-center justify-center"
          >
            <RiSendPlaneFill className="text-lg sm:text-xl" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoChat;