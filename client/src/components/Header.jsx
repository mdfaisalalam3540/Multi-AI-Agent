import React from "react";

const Header = () => {
  return (
    <header className="bg-linear-to-r from-blue-600 to-purple-700 text-white shadow-lg">
      <div className="container mx-auto px-4 py-6 text-center">
        <h1 className="text-4xl font-bold mb-2">Enterprise AI Analyst</h1>
        <p className="text-xl opacity-90">
          Your intelligent business analytics assistant
        </p>
      </div>
    </header>
  );
};

export default Header;
