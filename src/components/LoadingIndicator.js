// src/components/LoadingIndicator.js
export default function LoadingIndicator() {
  return (
    <div className="flex justify-start message-enter">
      <div className="bg-[#4a4a57] p-4 rounded-2xl">
        <div className="flex space-x-2">
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: "0.1s"}}></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: "0.2s"}}></div>
        </div>
      </div>
    </div>
  );
}