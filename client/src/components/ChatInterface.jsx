import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext"; // auth context for logout
import Message from "./Message";

const ChatInterface = () => {
  const { logout } = useAuth(); // logout function from context

  // state management
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [connectionError, setConnectionError] = useState("");

  // backend URL setup
  const BACKEND_URL =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:5010";

  // check backend connection
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

  // send message to backend
  const sendMessageToBackend = async (message) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      throw error;
    }
  };

  // load saved messages + check backend on mount
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
            text: "Welcome to Enterprise AI Analyst! How can I help with your business analytics today?",
            isUser: false,
            timestamp: new Date().toLocaleTimeString(),
            fullTimestamp: new Date().toISOString(),
          };
          setMessages([welcome]);
        }
      } catch {
        if (!saved) {
          const errMsg = {
            id: Date.now(),
            text: `Backend connection failed. Please make sure the server is running on ${BACKEND_URL}`,
            isUser: false,
            timestamp: new Date().toLocaleTimeString(),
            fullTimestamp: new Date().toISOString(),
          };
          setMessages([errMsg]);
        }
      }
    };
    init();
  }, []);

  // auto-save messages
  useEffect(() => {
    if (messages.length > 0)
      localStorage.setItem("chatMessages", JSON.stringify(messages));
  }, [messages]);

  // send message handler
  const handleSend = async () => {
    if (!inputMessage.trim() || isLoading) return;
    const userMsg = {
      id: Date.now(),
      text: inputMessage,
      isUser: true,
      timestamp: new Date().toLocaleTimeString(),
      fullTimestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputMessage("");
    setIsLoading(true);

    try {
      const res = await sendMessageToBackend(userMsg.text);
      const aiMsg = {
        id: res.messageId || Date.now() + 1,
        text: res.reply,
        isUser: false,
        timestamp: new Date(res.timestamp || new Date()).toLocaleTimeString(),
        fullTimestamp: res.timestamp || new Date().toISOString(),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      const errorMsg = {
        id: Date.now() + 1,
        text: `Failed to get response: ${err.message}`,
        isUser: false,
        timestamp: new Date().toLocaleTimeString(),
        fullTimestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // retry backend connection
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

  // clear chat messages
  const clearChat = () => {
    localStorage.removeItem("chatMessages");
    const welcome = {
      id: Date.now(),
      text: "Welcome to Enterprise AI Analyst! How can I help with your business analytics today?",
      isUser: false,
      timestamp: new Date().toLocaleTimeString(),
      fullTimestamp: new Date().toISOString(),
    };
    setMessages([welcome]);
  };

  // send message on Enter key
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[70vh] max-w-4xl mx-auto my-8 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center px-6 py-4 bg-linear-to-r from-gray-50 to-gray-100 border-b border-gray-200">
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
              onClick={retryConnection}
              className="ml-3 text-xs text-blue-600 hover:text-blue-800 underline"
            >
              Retry
            </button>
          )}
        </div>
        <div className="flex space-x-2">
          <button
            onClick={logout}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
          >
            Logout
          </button>
          <button
            onClick={clearChat}
            className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-200 rounded-lg"
          >
            Clear
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

      {/* Input */}
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
                : `Backend disconnected - start the server at ${BACKEND_URL}`
            }
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            disabled={!isConnected || isLoading}
          />
          <button
            onClick={handleSend}
            disabled={!isConnected || !inputMessage.trim() || isLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
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
              : `Backend disconnected at ${BACKEND_URL}`}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
