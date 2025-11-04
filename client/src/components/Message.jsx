import React from "react";

const Message = ({ message, isUser, timestamp }) => {
  return (
    <>
      <div className={`flex mb-4 ${isUser ? "justify-end" : "justify-start"}`}>
        <div
          className={`max-w-[70%] rounded-2xl px-4 py-3 shadow-sm ${
            isUser
              ? "bg-pink-600 text-white rounded-br-xs"
              : "bg-white text-gray-800 border border-gray-400 rounded-bl-xs"
          }`}
        >
          <div className="text-sm leading-6 mb-1">{message}</div>
          <div
            className={`text-xs opacity-60 ${
              isUser ? "text-white" : "text-orange-500"
            } text-right`}
          >
            {timestamp}
          </div>
        </div>
      </div>
    </>
  );
};

export default Message;
