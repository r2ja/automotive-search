// src/components/Message.js
export default function Message({ message, isUser, children }) {
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} message-enter`}>
      <div
        className={`max-w-[85%] sm:max-w-[80%] md:max-w-[70%] p-4 rounded-2xl ${
          isUser 
            ? "bg-[#1a1a1f] text-white ml-auto" 
            : "bg-[#4a4a57] text-white"
        }`}
      >
        <p className="whitespace-pre-wrap text-base leading-relaxed">
          {message}
        </p>
        {children}
      </div>
    </div>
  );
}