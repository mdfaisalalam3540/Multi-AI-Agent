import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ChatInterface from "../components/ChatInterface";

const ChatPage = () => {
  const { user } = useAuth(); // get user
  if (!user) return <Navigate to="/login" replace />; // redirect if not logged in
  return <ChatInterface />; // show chat only if authenticated
};

export default ChatPage;
