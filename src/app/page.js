// src/app/page.js
"use client";
import { useState, useRef, useEffect } from "react";
import Header from "@/components/Header";
import CarCard from "@/components/CarCard";
import Message from "@/components/Message";
import LoadingIndicator from "@/components/LoadingIndicator";
import { carRecommendations, conversationFlows, botResponses } from "@/data/mockData";

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showCarCards, setShowCarCards] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const [cars, setCars] = useState([]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, showCarCards, cars]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const getBotResponse = (userInput) => {
    const lowerInput = userInput.toLowerCase();
    if (conversationFlows.greetings.some(g => lowerInput.includes(g))) return botResponses.greeting;
    if (conversationFlows.buyIntent.some(i => lowerInput.includes(i))) return botResponses.askType;
    if (conversationFlows.budgetKeywords.some(b => lowerInput.includes(b))) return botResponses.budgetResponse;
    if (conversationFlows.featureKeywords.some(f => lowerInput.includes(f))) return botResponses.mileageResponse;
    if (conversationFlows.safetyKeywords.some(s => lowerInput.includes(s))) {
      setShowCarCards(true);
      return botResponses.safetyResponse;
    }
    return botResponses.defaultResponse;
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const resp = await fetch("/api/rag", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: userMessage.content, messages })
      });
      const data = await resp.json();

      // Use the server-provided assistant answer if present
      const assistantResponse = data?.answer || getBotResponse(userMessage.content);

      // Append assistant message into the chat UI
      setMessages(prev => [...prev, { role: "assistant", content: assistantResponse }]);

      // If API returned car rows, show them (these are hydrated from Supabase)
      if (Array.isArray(data?.cars) && data.cars.length > 0) {
        setCars(data.cars);
        setShowCarCards(true);
      } else {
        // if none returned, optionally hide cards
        setShowCarCards(false);
      }
    } catch (e) {
      console.error("RAG call failed:", e);
      setMessages(prev => [...prev, { role: "assistant", content: "Sorry, something went wrong. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleTagClick = (tagText) => {
    setInput(tagText);
    setTimeout(() => textareaRef.current?.focus(), 100);
  };

  const getQuickActionTag = (msg, idx) => {
    if (msg.role !== "user") return null;
    if (idx === 0 && msg.content.toLowerCase().includes("hello")) {
      return { text: "yes i want to buy a car", onClick: () => handleTagClick("yes i want to buy a car") };
    }
    if (msg.content.toLowerCase().includes("mileage")) {
      return { text: "50,000", onClick: () => handleTagClick("50,000") };
    }
    if (msg.content.includes("50,000")) {
      return { text: "ok safety", onClick: () => handleTagClick("ok safety") };
    }
    return null;
  };

  return (
    <div className="bg-[#3a3a47] min-h-screen text-[#ededed] flex flex-col">
      <Header />

      <div className="flex-1 overflow-hidden flex flex-col max-w-4xl mx-auto w-full px-4 py-4 sm:py-6">
        <div className="flex-1 overflow-y-auto mb-6 space-y-4 scrollbar-custom">
          {messages.length === 0 && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <p className="text-gray-400 text-lg">Welcome to Sakura Labs!</p>
                <p className="text-gray-500 text-sm mt-2">Start by saying hello or asking about cars.</p>
              </div>
            </div>
          )}

          {messages.map((msg, idx) => (
            <Message key={idx} message={msg.content} isUser={msg.role === "user"} />
          ))}

          {/* Car Recommendations Cards */}
          {showCarCards && !loading && cars.length > 0 && (
            <div className="mt-6 space-y-4">
              <div className="text-sm text-gray-300 mb-2">Recommended cars:</div>
              {cars.map((car) => (
                <CarCard key={car.Car_ID || car.id} car={car} />
              ))}
              <div className="mt-4">
                <Message message={"Want more details about any of these? Click a card or ask for specifics."} isUser={false} />
              </div>
            </div>
          )}

          {loading && <LoadingIndicator />}

          <div ref={messagesEndRef} />
        </div>

        <div className="relative">
          <textarea
            ref={textareaRef}
            className="w-full p-4 pr-14 rounded-2xl bg-[#2a2a35] text-white resize-none focus:outline-none focus:ring-2 focus:ring-pink-500/50 transition-all placeholder-gray-400"
            rows={1}
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            style={{ minHeight: "56px", maxHeight: "120px", overflowY: "auto" }}
          />
          <button
            onClick={sendMessage}
            className="absolute right-3 bottom-3 p-2 rounded-full hover:bg-[#1a1a1f] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading || !input.trim()}
          >
            <svg
              className={`w-6 h-6 transition-colors ${input.trim() ? "text-white" : "text-gray-500"}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
