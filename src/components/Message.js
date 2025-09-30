// src/components/Message.js
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

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
        <div className="prose prose-invert prose-sm max-w-none">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              // Style markdown elements
              p: ({node, ...props}) => <p className="mb-2 last:mb-0 leading-relaxed" {...props} />,
              ul: ({node, ...props}) => <ul className="list-disc list-inside mb-2 space-y-1" {...props} />,
              ol: ({node, ...props}) => <ol className="list-decimal list-inside mb-2 space-y-1" {...props} />,
              li: ({node, ...props}) => <li className="leading-relaxed" {...props} />,
              strong: ({node, ...props}) => <strong className="font-semibold text-white" {...props} />,
              em: ({node, ...props}) => <em className="italic" {...props} />,
              a: ({node, ...props}) => <a className="text-blue-400 hover:underline" {...props} />,
            }}
          >
            {message}
          </ReactMarkdown>
        </div>
        {children}
      </div>
    </div>
  );
}