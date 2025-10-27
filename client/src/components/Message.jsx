import React from "react";

const Message = ({ message, isUser, timestamp }) => {
  return (
    <div className={`flex mb-4 ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[70%] rounded-2xl px-4 py-3 shadow-sm ${
          isUser
            ? "bg-pink-600 text-white rounded-br-md"
            : "bg-white text-gray-800 border border-gray-200 rounded-bl-md"
        }`}
      >
        <div className="text-sm leading-6 mb-1">{message}</div>
        <div
          className={`text-xs opacity-70 ${
            isUser ? "text-white-600" : "text-orange-500"
          } text-right`}
        >
          {timestamp}
        </div>
      </div>
    </div>
  );
};

export default Message;
