import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Header from "./components/Header";
import ChatPage from "./pages/ChatPage";
import Login from "./pages/Login";
import Register from "./pages/Register";

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-linear-to-br from-slate-50 to-blue-50">
          <Header /> {/* top navbar */}
          <main className="container mx-auto px-4">
            <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/chat" element={<ChatPage />} />
            </Routes>
          </main>
          <footer className="text-center py-6 text-gray-600 text-sm">
            <p>
              Enterprise AI Analyst • Built with Vite + React & Tailwind CSS
            </p>
          </footer>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
