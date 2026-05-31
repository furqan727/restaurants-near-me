import React, { useState, useEffect, useRef } from "react";
import { MessageSquare, X, Send, Sparkles, Navigation, MapPin } from "lucide-react";
import { ChatMessage } from "../types";

interface AIAssistantProps {
  userLocation: { latitude: number; longitude: number } | null;
  locating: boolean;
  onLocate: () => void;
}

export default function AIAssistant({ userLocation, locating, onLocate }: AIAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: "bot",
      text: "Namaste! I am your Local Restaurant Guide, a personal AI food assistant. Tell me which city you are in or what favorite dish you feel like eating (e.g. delicious Biryani, Butter Chicken or Ghee Dosa)! How can I help you find top-rated food near you today?"
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const rawText = textToSend || input;
    if (!rawText.trim() || loading) return;

    const updatedMessages = [...messages, { sender: "user" as const, text: rawText }];
    setMessages(updatedMessages);
    if (!textToSend) setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages,
          userLocation: userLocation
        })
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { sender: "bot", text: data.response }]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "I faced a brief connection issue. However, you can explore traditional North and South Indian, Mughlai, or Rajasthani delicacies in our directory!"
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end" id="ai-assistant-widget">
      {/* Floating Chat Bubble */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 bg-orange-600 hover:bg-orange-500 active:scale-95 text-white p-4 rounded-full shadow-xl shadow-orange-600/20 md:pr-6 cursor-pointer group transition-all"
          id="chat-bubble-toggle"
        >
          <div className="relative">
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            <MessageSquare className="w-6 h-6 shrink-0 group-hover:rotate-6 transition-transform" />
          </div>
          <span className="text-sm font-bold tracking-tight hidden md:inline-block">Ask Food AI</span>
        </button>
      )}

      {/* Expandable Chat Window */}
      {isOpen && (
        <div className="w-[calc(100vw-2rem)] sm:w-96 h-[500px] bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden flex flex-col shadow-2xl transition-all animate-in fade-in slide-in-from-bottom-4 duration-200">
          {/* Header */}
          <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></div>
              <div>
                <h3 className="text-sm font-bold text-white leading-none">Local Food Guide AI</h3>
                <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase block mt-1">Connoisseur Assistant</span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 px-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Body */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 select-text">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`p-3.5 rounded-2xl leading-relaxed text-xs max-w-[85%] ${
                  msg.sender === "user"
                    ? "bg-orange-600 text-white ml-auto font-semibold"
                    : "bg-slate-800 text-slate-200 mr-auto border border-slate-700/60 font-medium"
                }`}
              >
                {msg.sender === "user" ? (
                  <p className="whitespace-pre-line">{msg.text}</p>
                ) : (
                  <div className="space-y-1 text-slate-200">
                    {(() => {
                      return msg.text.split("\n").map((line, i) => {
                        // Bold parsing inside list & paragraphs
                        const parts: React.ReactNode[] = [];
                        let boldRegex = /\*\*(.*?)\*\*/g;
                        let lastIndex = 0;
                        let match;
                        while ((match = boldRegex.exec(line)) !== null) {
                          if (match.index > lastIndex) {
                            parts.push(line.substring(lastIndex, match.index));
                          }
                          parts.push(
                            <strong key={match.index} className="text-orange-400 font-extrabold font-sans">
                              {match[1]}
                            </strong>
                          );
                          lastIndex = boldRegex.lastIndex;
                        }
                        if (lastIndex < line.length) {
                          parts.push(line.substring(lastIndex));
                        }

                        const renderableContent = parts.length > 0 ? parts : line;

                        // Check bullet style
                        if (line.trim().startsWith("- ") || line.trim().startsWith("* ")) {
                          const cleanedLine = line.trim().replace(/^[-*]\s+/, "");
                          // Re-parse bold for list item string if parts was bypassed
                          const cleanParts: React.ReactNode[] = [];
                          let listMatch;
                          let listLastIndex = 0;
                          boldRegex.lastIndex = 0; // reset
                          while ((listMatch = boldRegex.exec(cleanedLine)) !== null) {
                            if (listMatch.index > listLastIndex) {
                              cleanParts.push(cleanedLine.substring(listLastIndex, listMatch.index));
                            }
                            cleanParts.push(
                              <strong key={listMatch.index} className="text-orange-400 font-extrabold">
                                {listMatch[1]}
                              </strong>
                            );
                            listLastIndex = boldRegex.lastIndex;
                          }
                          if (listLastIndex < cleanedLine.length) {
                            cleanParts.push(cleanedLine.substring(listLastIndex));
                          }

                          return (
                            <li key={i} className="ml-4 list-disc text-slate-250 pl-1 py-0.5 leading-relaxed">
                              {cleanParts.length > 0 ? cleanParts : cleanedLine}
                            </li>
                          );
                        }

                        // Check headers
                        if (line.trim().startsWith("### ")) {
                          const hText = line.trim().replace(/^###\s+/, "");
                          return (
                            <h4 key={i} className="text-[12px] font-black text-orange-400 tracking-tight mt-3 mb-1 uppercase flex items-center gap-1 font-sans">
                              ✨ {hText}
                            </h4>
                          );
                        }

                        if (line.trim().startsWith("## ")) {
                          const hText = line.trim().replace(/^##\s+/, "");
                          return (
                            <h3 key={i} className="text-xs font-black text-white tracking-tight mt-4 mb-1.5 border-b border-slate-700/60 pb-1.5 uppercase font-sans">
                              🍲 {hText}
                            </h3>
                          );
                        }

                        return (
                          <p key={i} className="min-h-[1.25em] leading-relaxed">
                            {renderableContent}
                          </p>
                        );
                      });
                    })()}
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-2 text-slate-450 text-[10px] italic text-slate-400 p-2">
                <Sparkles className="w-3.5 h-3.5 animate-spin text-orange-500" />
                Curating culinary recommendations...
              </div>
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* Presets / Ask Shortcut Chips */}
          <div className="px-4 pb-2 pt-1.5 border-t border-slate-850 bg-slate-950/40 space-y-1">
            <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">Tap standard inquiries:</span>
            <div className="flex flex-wrap gap-1">
              <button
                onClick={() => handleSendMessage("Where can I find the best pizzas or microbreweries in Indiranagar?")}
                className="text-[10px] font-medium bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 px-2 py-1 rounded hover:border-orange-500 hover:text-white transition-all text-left"
                disabled={loading}
              >
                🍕 Indiranagar Breweries
              </button>
              <button
                onClick={() => handleSendMessage("Suggest authentic tiffin options or filter coffee in Bengaluru.")}
                className="text-[10px] font-medium bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 px-2 py-1 rounded hover:border-orange-500 hover:text-white transition-all text-left"
                disabled={loading}
              >
                🥞 Filter Coffee (Bengaluru)
              </button>
            </div>
          </div>

          {/* Location status within chat widget */}
          <div className="bg-slate-950 border-t border-slate-850 px-4 py-2 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-orange-500 shrink-0" />
              {userLocation
                ? `GPS: ${userLocation.latitude.toFixed(3)}, ${userLocation.longitude.toFixed(3)}`
                : "No GPS Shared"}
            </span>
            {!userLocation && (
              <button
                onClick={onLocate}
                className="text-[10px] font-bold text-orange-400 hover:text-orange-350 bg-slate-850 px-2 py-0.5 rounded transition"
              >
                {locating ? "Scanning GPS..." : "Share Location"}
              </button>
            )}
          </div>

          {/* Input Box Form */}
          <div className="p-3 bg-slate-950 border-t border-slate-850 flex items-center gap-1.5">
            <input
              type="text"
              placeholder="Ask for dishes, cities, or spice rating..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              className="flex-1 bg-slate-800 text-white rounded-xl px-3.5 py-2 text-xs outline-none border border-slate-700 focus:border-orange-500 placeholder-slate-500 transition-all"
              disabled={loading}
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={loading || !input.trim()}
              className="p-2.5 bg-orange-600 hover:bg-orange-500 disabled:bg-slate-800 text-white rounded-xl transition cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
