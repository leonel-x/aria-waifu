import { User, Bot } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  personality?: string;
  isWelcome?: boolean;
  isLoading?: boolean;
}

export function ChatMessage({ 
  role, 
  content, 
  timestamp, 
  personality, 
  isWelcome,
  isLoading 
}: ChatMessageProps) {
  const isUser = role === "user";
  
  return (
    <div className={`flex items-start space-x-3 ${isUser ? "flex-row-reverse space-x-reverse" : ""}`}>
      {/* Avatar */}
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
        isUser 
          ? "bg-gradient-to-br from-[var(--aria-pink)] to-[var(--aria-purple)]"
          : "bg-gradient-to-br from-[var(--aria-cyan)] to-[var(--aria-purple)]"
      }`}>
        {isUser ? (
          <User className="w-4 h-4 text-white" />
        ) : (
          <Bot className="w-4 h-4 text-white" />
        )}
      </div>

      {/* Message Bubble */}
      <div className={`rounded-2xl p-4 max-w-xs md:max-w-md ${
        isUser 
          ? "chat-bubble-user rounded-tr-md"
          : "chat-bubble-aria rounded-tl-md"
      }`}>
        <div className="text-white text-sm md:text-base">
          {isLoading ? (
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
              <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
              <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
            </div>
          ) : (
            <p className="whitespace-pre-wrap">{content}</p>
          )}
        </div>
        
        {!isLoading && (
          <div className="text-xs text-gray-300 mt-2">
            {isWelcome ? "Just now" : formatDistanceToNow(timestamp, { addSuffix: true })}
          </div>
        )}
      </div>
    </div>
  );
}
