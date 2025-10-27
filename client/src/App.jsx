import React from "react";
import Header from "./components/Header";
import ChatInterface from "./components/ChatInterface";

function App() {
  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-blue-50">
      <Header />
      <main className="container mx-auto px-4">
        <ChatInterface />
      </main>

      {/* Footer */}
      <footer className="text-center py-6 text-gray-600 text-sm">
        <p>Enterprise AI Analyst • Built with Vite + React & Tailwind CSS</p>
      </footer>
    </div>
  );
}

export default App;
