import React, { useState, useEffect } from "react";
import Message from "./Message";

const ChatInterface = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [connectionError, setConnectionError] = useState("");

  // Use environment variable with fallback
  const BACKEND_URL =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:5010";

  // Test backend connection
  const testBackendConnection = async () => {
    try {
      console.log("Testing backend connection to:", BACKEND_URL);
      const response = await fetch(`${BACKEND_URL}/api/test`);

      // Check if response is JSON
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        throw new Error(
          `Expected JSON but got: ${contentType}. Response: ${text.substring(
            0,
            100
          )}`
        );
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Backend connection successful:", data);
      return data;
    } catch (error) {
      console.error("Backend connection failed:", error);
      setConnectionError(error.message);
      throw error;
    }
  };

  // Send message to backend
  const sendMessageToBackend = async (message) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
      });

      // Check if response is JSON
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        throw new Error(
          `Expected JSON but got: ${contentType}. Response: ${text.substring(
            0,
            100
          )}`
        );
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Failed to send message:", error);
      throw error;
    }
  };

  // Load messages and test connection on component mount
  useEffect(() => {
    // Load messages from localStorage FIRST
    const savedMessages = localStorage.getItem("chatMessages");
    console.log("Loading messages from localStorage:", savedMessages);

    if (savedMessages) {
      try {
        const parsedMessages = JSON.parse(savedMessages);
        setMessages(parsedMessages);
        console.log("Successfully loaded", parsedMessages.length, "messages");
      } catch (error) {
        console.error("Error parsing saved messages:", error);
        // If parsing fails, start fresh but don't add welcome message yet
        setMessages([]);
      }
    } else {
      // No saved messages - we'll add welcome message after connection test
      console.log("No existing messages found");
      setMessages([]);
    }

    // Then test connection (this should NOT affect existing messages)
    const initializeConnection = async () => {
      try {
        await testBackendConnection();
        setIsConnected(true);
        setConnectionError("");

        // Only add welcome message if there are absolutely no messages
        const currentMessages = localStorage.getItem("chatMessages");
        if (!currentMessages) {
          const welcomeMessage = {
            id: Date.now(),
            text: `Welcome to Enterprise AI Analyst! How can I help with your business analytics today?`,
            isUser: false,
            timestamp: new Date().toLocaleTimeString(),
            fullTimestamp: new Date().toISOString(),
          };
          setMessages([welcomeMessage]);
          console.log("Added welcome message to new chat");
        }
      } catch (error) {
        setIsConnected(false);
        setConnectionError(error.message);
        console.error(
          "Backend connection failed, but keeping existing messages"
        );

        // Even if connection fails, if we have messages, keep them
        // Only add error message if completely empty
        const currentMessages = localStorage.getItem("chatMessages");
        if (!currentMessages) {
          const errorMessage = {
            id: Date.now(),
            text: `Backend connection failed. Please make sure the server is running on ${BACKEND_URL}`,
            isUser: false,
            timestamp: new Date().toLocaleTimeString(),
            fullTimestamp: new Date().toISOString(),
          };
          setMessages([errorMessage]);
        }
      }
    };

    initializeConnection();
  }, []);

  // Save messages to localStorage whenever messages change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem("chatMessages", JSON.stringify(messages));
      console.log("Auto-saved", messages.length, "messages to localStorage");
    }
  }, [messages]);

  const handleSend = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      text: inputMessage,
      isUser: true,
      timestamp: new Date().toLocaleTimeString(),
      fullTimestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentInput = inputMessage;
    setInputMessage("");
    setIsLoading(true);

    try {
      const response = await sendMessageToBackend(currentInput);
      const aiMessage = {
        id: response.messageId || Date.now() + 1,
        text: response.reply,
        isUser: false,
        timestamp: new Date(
          response.timestamp || new Date()
        ).toLocaleTimeString(),
        fullTimestamp: response.timestamp || new Date().toISOString(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        text: `Failed to get response: ${error.message}`,
        isUser: false,
        timestamp: new Date().toLocaleTimeString(),
        fullTimestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const retryConnection = async () => {
    try {
      await testBackendConnection();
      setIsConnected(true);
      setConnectionError("");
    } catch (error) {
      setIsConnected(false);
      setConnectionError(error.message);
    }
  };

  const clearChat = () => {
    console.log("Clearing all chat messages");
    setMessages([]);
    localStorage.removeItem("chatMessages");

    // Add fresh welcome message after clearing
    const welcomeMessage = {
      id: Date.now(),
      text: `Welcome to Enterprise AI Analyst! How can I help with your business analytics today?`,
      isUser: false,
      timestamp: new Date().toLocaleTimeString(),
      fullTimestamp: new Date().toISOString(),
    };
    setMessages([welcomeMessage]);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[70vh] max-w-4xl mx-auto my-8 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Chat Header */}
      <div className="flex justify-between items-center px-6 py-4 bg-linear-to-r from-gray-50 to-gray-100 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div
            className={`w-3 h-3 rounded-full ${
              isConnected ? "bg-green-500" : "bg-red-500"
            }`}
          ></div>
          <div>
            <span className="text-sm font-medium text-gray-700">
              Status:{" "}
              <span className={isConnected ? "text-green-600" : "text-red-600"}>
                {isConnected ? "Connected" : "Disconnected"}
              </span>
            </span>
            {connectionError && (
              <button
                onClick={retryConnection}
                className="ml-3 text-xs text-blue-600 hover:text-blue-800 underline"
              >
                Retry Connection
              </button>
            )}
          </div>
        </div>
        <div className="flex space-x-2">
          {connectionError && (
            <span
              className="text-xs text-red-600 max-w-xs truncate"
              title={connectionError}
            >
              {connectionError}
            </span>
          )}
          <button
            onClick={clearChat}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition-colors duration-200 font-medium"
          >
            Clear Chat
          </button>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-6 bg-linear-to-br from-blue-50 to-purple-50">
        <div className="max-w-3xl mx-auto">
          {messages.map((message) => (
            <Message
              key={message.id}
              message={message.text}
              isUser={message.isUser}
              timestamp={message.timestamp}
            />
          ))}
          {isLoading && (
            <div className="flex justify-start mb-4">
              <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input Container */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
        <div className="flex space-x-4 max-w-3xl mx-auto">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={
              isConnected
                ? "Ask about business analytics, data insights, or reports..."
                : `Backend disconnected - please start the server at ${BACKEND_URL}`
            }
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            disabled={!isConnected || isLoading}
          />
          <button
            onClick={handleSend}
            disabled={!isConnected || !inputMessage.trim() || isLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 whitespace-nowrap disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Sending...
              </div>
            ) : (
              "Send"
            )}
          </button>
        </div>
        <div className="text-center mt-2">
          <span className="text-xs text-gray-500">
            {isConnected
              ? "Press Enter to send • Shift+Enter for new line"
              : `Start backend server at ${BACKEND_URL}`}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
