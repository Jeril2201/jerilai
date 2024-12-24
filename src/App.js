import React, { useState, useEffect, useRef } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { FaMicrophone, FaCog } from "react-icons/fa";
import { AiOutlineSend } from "react-icons/ai";
import "./App.css";
import ChatHistory from "./component/ChatHistory";
import Loading from "./component/Loading";

const App = () => {
  const [userInput, setUserInput] = useState("");
  const [chatHistory, setChatHistory] = useState([
    { type: "bot", message: "Hi boss, how can I help you?" },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState("Text");
  const [selectedVoice, setSelectedVoice] = useState("female");
  const [showVoicePopup, setShowVoicePopup] = useState(false);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const chatEndRef = useRef(null);

  // Initialize Gemini API
  const genAI = new GoogleGenerativeAI("AIzaSyAWbTSPGoWa_VwOua4fhOoqfIx5YgLqXJ4");
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-002" });

  // Auto-scroll to the bottom of the chat
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatHistory]);

  // Function to handle user input
  const handleUserInput = (e) => {
    setUserInput(e.target.value);
  };

  // Function to send user message to Gemini
  const sendMessage = async () => {
    if (userInput.trim() === "") return;

    setIsLoading(true);
    try {
      const result = await model.generateContent(userInput);
      const response = await result.response;
      const botMessage = response.text();

      setChatHistory([
        ...chatHistory,
        { type: "user", message: userInput },
        { type: "bot", message: botMessage },
      ]);

      // Speak bot response if in Voice mode
      if (mode === "Voice") {
        speak(botMessage);
      }
    } catch {
      console.error("Error sending message");
    } finally {
      setUserInput("");
      setIsLoading(false);
    }
  };

  // Function to toggle mode
  const toggleMode = (selectedMode) => {
    if (selectedMode === "Voice") {
      setMode("Voice");
      setShowVoicePopup(true);
    } else {
      setMode("Text");
    }
    setShowSettingsMenu(false); // Close settings menu
  };

  // Function to handle voice selection
  const handleVoiceSelection = (voice) => {
    setSelectedVoice(voice);
    setShowVoicePopup(false);
  };

  // Text-to-speech function
  const speak = (text) => {
    const synth = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";

    // Select voice based on user choice
    const voices = synth.getVoices();
    utterance.voice = voices.find((voice) =>
      selectedVoice === "female"
        ? voice.name.includes("Female") || voice.name.includes("Google UK English Female")
        : voice.name.includes("Male") || voice.name.includes("Google UK English Male")
    );

    synth.speak(utterance);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-900 text-white">
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 shadow-md bg-gray-800">
        <div className="flex items-center space-x-4">
          <img
            src="/JR-RJ-logo-design-vector-Graphics-17172117-1-1-580x386 1.jpg"
            alt="Logo"
            className="w-10 h-10 rounded-full"
          />
          <h1 className="text-lg font-bold">Jeril Personal AI</h1>
        </div>

        {/* Settings Icon for Mobile */}
        <div className="relative md:hidden">
          <button
            className="text-gray-400 hover:text-white focus:outline-none"
            onClick={() => setShowSettingsMenu(!showSettingsMenu)}
          >
            <FaCog size={24} />
          </button>
          {showSettingsMenu && (
            <div className="absolute right-0 mt-2 w-32 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-50">
              <button
                className="block w-full px-4 py-2 text-sm text-left hover:bg-gray-700"
                onClick={() => toggleMode("Text")}
              >
                Text Mode
              </button>
              <button
                className="block w-full px-4 py-2 text-sm text-left hover:bg-gray-700"
                onClick={() => toggleMode("Voice")}
              >
                Voice Mode
              </button>
            </div>
          )}
        </div>

        {/* Mode Toggle for Desktop */}
        <div className="hidden md:flex items-center bg-gray-700 rounded-full shadow-md">
          <button
            className={`w-24 px-4 py-2 text-sm rounded-full transition duration-300 ${
              mode === "Text" ? "bg-blue-500 text-white" : "text-gray-400"
            }`}
            onClick={() => toggleMode("Text")}
          >
            Text
          </button>
          <button
            className={`w-24 px-4 py-2 text-sm rounded-full transition duration-300 ${
              mode === "Voice" ? "bg-blue-500 text-white" : "text-gray-400"
            }`}
            onClick={() => toggleMode("Voice")}
          >
            Voice
          </button>
        </div>
      </nav>

      {/* Chat Box */}
      <div className="flex-grow w-full max-w-3xl mx-auto p-6">
        <div className="chat-container bg-gray-800 rounded-lg shadow-lg p-6 space-y-4">
          <ChatHistory chatHistory={chatHistory} />
          <Loading isLoading={isLoading} />
          <div ref={chatEndRef}></div>
        </div>
      </div>

      {/* Input Section */}
      <div className="fixed bottom-0 w-full bg-gray-800 px-4 py-3 shadow-lg">
        <div className="relative flex items-center w-full max-w-3xl mx-auto">
          <input
            type="text"
            className="flex-grow px-4 py-3 rounded-full border border-gray-700 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300 bg-gray-700 text-white pr-16"
            placeholder="Type your message..."
            value={userInput}
            onChange={handleUserInput}
          />
          <button
            className="absolute right-8 inset-y-0 flex items-center justify-center text-gray-500 hover:text-blue-500 transition duration-300 mr-4"
            onClick={speak}
          >
            <FaMicrophone size={20} />
          </button>
          <button
            className="absolute right-3 inset-y-0 flex items-center justify-center w-8 h-8 mt-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg"
            onClick={sendMessage}
          >
            <AiOutlineSend size={20} />
          </button>
        </div>
      </div>

      {/* Voice Selection Popup */}
      {showVoicePopup && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-lg font-bold mb-4 text-center">Select Voice</h2>
            <div className="flex space-x-4">
              <button
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full"
                onClick={() => handleVoiceSelection("female")}
              >
                Female
              </button>
              <button
                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-full"
                onClick={() => handleVoiceSelection("male")}
              >
                Male
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
