"use client";
import Form from "@/components/Form";
import VideoChat from "@/components/VideoChat/VideoChat";
import React, { useState } from "react";

const Home = () => {
  const [showForm, setShowForm] = useState(true);

  const handleFormSubmit = () => {
    setShowForm(false);
  };

  return (
    <main className="min-h-screen bg-app-bg bg-[#FBD802] bg-cover bg-center flex items-center justify-center p-2 sm:p-4 md:px-10">
      <div className="w-full min-h-[500px] h-[calc(100vh-4rem)] flex flex-col items-center justify-center bg-[#852EFF] rounded-lg md:rounded-2xl border-2 border-white shadow-[4px_4px_0_0_black] md:shadow-[8px_8px_0_0_black] relative overflow-hidden">
        {/* VideoChat component as the background */}
        <div className="absolute inset-0 w-full h-full z-0">
          <VideoChat />
        </div>

        {/* Form component with glass morphic effect */}
        {showForm && (
          <div className="relative z-10 w-full h-full items-center justify-center flex p-6 backdrop-blur-3xl rounded-lg shadow-lg">
            <Form onFormSubmit={handleFormSubmit} />
          </div>
        )}
      </div>
    </main>
  );
};

export default Home;
