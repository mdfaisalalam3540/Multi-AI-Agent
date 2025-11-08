// src/components/ChatInterface.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Message from "./Message";
import { Paperclip } from "lucide-react";

const ChatInterface = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [connectionError, setConnectionError] = useState("");

  const BACKEND_URL =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:5010";

  // Redirect if not logged in
  useEffect(() => {
    if (!user) navigate("/login");
  }, [user, navigate]);

  // Test backend connection
  const testBackendConnection = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/test`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      setIsConnected(true);
      setConnectionError("");
      return data;
    } catch (error) {
      setIsConnected(false);
      setConnectionError(error.message);
      throw error;
    }
  };

  // Send message to backend
  const sendMessageToBackend = async (message) => {
    const response = await fetch(`${BACKEND_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  };

  // Upload file to backend
  const uploadFileToBackend = async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${BACKEND_URL}/api/docs/upload`, {
      method: "POST",
      body: formData,
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  };

  // Load saved messages on mount
  useEffect(() => {
    const saved = localStorage.getItem("chatMessages");
    if (saved) {
      try {
        setMessages(JSON.parse(saved));
      } catch {
        setMessages([]);
      }
    }

    const init = async () => {
      try {
        await testBackendConnection();
        if (!saved) {
          const welcome = {
            id: Date.now(),
            text: "Welcome to Enterprise AI Analyst! Upload a document or ask a question below.",
            isUser: false,
            timestamp: new Date().toLocaleTimeString(),
          };
          setMessages([welcome]);
        }
      } catch {
        const errMsg = {
          id: Date.now(),
          text: `Backend connection failed. Please start your server at ${BACKEND_URL}`,
          isUser: false,
          timestamp: new Date().toLocaleTimeString(),
        };
        setMessages([errMsg]);
      }
    };

    init();
  }, []);

  // Auto-save messages
  useEffect(() => {
    if (messages.length > 0)
      localStorage.setItem("chatMessages", JSON.stringify(messages));
  }, [messages]);

  // Handle message send
  const handleSend = async () => {
    if ((!inputMessage.trim() && !selectedFile) || isLoading) return;
    setIsLoading(true);

    if (selectedFile) {
      const userMsg = {
        id: Date.now(),
        text: `Uploaded: ${selectedFile.name}`,
        isUser: true,
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages((prev) => [...prev, userMsg]);

      try {
        const res = await uploadFileToBackend(selectedFile);
        const successMsg = {
          id: Date.now() + 1,
          text: `${res.message}\n\nExtracted Summary:\n${
            res.data?.extractedText?.slice(0, 500) || "No text extracted."
          }`,
          isUser: false,
          timestamp: new Date().toLocaleTimeString(),
        };
        setMessages((prev) => [...prev, successMsg]);
      } catch (err) {
        const errorMsg = {
          id: Date.now() + 2,
          text: `File upload failed: ${err.message}`,
          isUser: false,
          timestamp: new Date().toLocaleTimeString(),
        };
        setMessages((prev) => [...prev, errorMsg]);
      } finally {
        setSelectedFile(null);
        setIsLoading(false);
      }
      return;
    }

    const userMsg = {
      id: Date.now(),
      text: inputMessage,
      isUser: true,
      timestamp: new Date().toLocaleTimeString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputMessage("");

    try {
      const res = await sendMessageToBackend(userMsg.text);
      const fullReply = res.data?.reply || "No response received from AI.";

      const aiMsg = {
        id: Date.now() + 1,
        text: "",
        isUser: false,
        timestamp: new Date().toLocaleTimeString(),
      };

      setMessages((prev) => [...prev, aiMsg]);

      let index = 0;
      const interval = setInterval(() => {
        index++;
        setMessages((prev) =>
          prev.map((m) =>
            m.id === aiMsg.id ? { ...m, text: fullReply.slice(0, index) } : m
          )
        );
        if (index >= fullReply.length) clearInterval(interval);
      }, 15);
    } catch (err) {
      const errorMsg = {
        id: Date.now() + 1,
        text: `Failed to get response: ${err.message}`,
        isUser: false,
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Enter key
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = (e) => setSelectedFile(e.target.files[0]);

  // Clear chat instantly
  const handleClearChat = () => {
    localStorage.removeItem("chatMessages");
    setMessages([]);
  };

  return (
    <div className="flex flex-col h-[70vh] max-w-4xl mx-auto my-8 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center px-6 py-4 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div
            className={`w-3 h-3 rounded-full ${
              isConnected ? "bg-green-500" : "bg-red-500"
            }`}
          ></div>
          <span className="text-sm font-medium text-gray-700">
            {isConnected ? "Connected" : "Disconnected"}
          </span>
          {connectionError && (
            <button
              onClick={testBackendConnection}
              className="ml-3 text-xs text-blue-600 hover:text-blue-800 underline"
            >
              Retry
            </button>
          )}
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleClearChat}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
          >
            Clear
          </button>
          <button
            onClick={logout}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 bg-linear-to-br from-blue-50 to-purple-50">
        <div className="max-w-3xl mx-auto">
          {messages.map((m) => (
            <Message
              key={m.id}
              message={m.text}
              isUser={m.isUser}
              timestamp={m.timestamp}
            />
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
        <div className="flex items-center space-x-3 max-w-3xl mx-auto">
          <input
            id="file-upload"
            type="file"
            onChange={handleFileSelect}
            className="hidden"
          />
          <label htmlFor="file-upload" className="cursor-pointer">
            <Paperclip className="w-5 h-5 text-gray-500 hover:text-blue-600 transition" />
          </label>

          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={
              selectedFile
                ? `Ready to upload: ${selectedFile.name}`
                : "Ask a question or attach a file..."
            }
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            disabled={!isConnected || isLoading}
          />

          <button
            onClick={handleSend}
            disabled={!isConnected || isLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isLoading ? "..." : "Send"}
          </button>
        </div>
        {selectedFile && (
          <p className="text-xs text-gray-500 text-center mt-1">
            Selected file: {selectedFile.name}
          </p>
        )}
      </div>
    </div>
  );
};

export default ChatInterface;
