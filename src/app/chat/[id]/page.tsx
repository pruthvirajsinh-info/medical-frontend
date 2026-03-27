"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { useSocket } from "@/hooks/useSocket";
import { useGetMeQuery } from "@/store/api/authApi";
import { useGetChatHistoryQuery } from "@/store/api/chatApi";
import { 
  Send, ArrowLeft, User, Activity, 
  MessageSquare, Clock, Shield, CheckCheck 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ChatPage() {
  const { id: receiverId } = useParams();
  const router = useRouter();
  const { data: user } = useGetMeQuery({});
  const { data: history, isLoading: historyLoading } = useGetChatHistoryQuery(receiverId as string);
  const { socket, isConnected, joinChat, sendMessage } = useSocket();
  
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (history) {
      setMessages(history);
    }
  }, [history]);

  useEffect(() => {
    if (isConnected && receiverId) {
      joinChat(receiverId as string);
    }
  }, [isConnected, receiverId]);

  useEffect(() => {
    if (!socket) return;

    socket.on("receive_message", (message: any) => {
      setMessages((prev) => [...prev, message]);
    });

    return () => {
      socket.off("receive_message");
    };
  }, [socket]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !receiverId) return;

    sendMessage(receiverId as string, inputText);
    setInputText("");
  };

  const isPatient = user?.role === "PATIENT";

  return (
    <div className="flex flex-col h-screen bg-gray-50 overflow-hidden font-sans">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-md">
              <User size={20} />
            </div>
            <div>
              <h1 className="font-black text-gray-900 leading-tight">Consultation Session</h1>
              <div className="flex items-center space-x-2">
                <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`} />
                <span className="text-[10px] font-black tracking-widest text-gray-400 uppercase">
                  {isConnected ? 'Live Connection' : 'Disconnected'}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="hidden md:flex items-center space-x-4 bg-gray-50 px-4 py-2 rounded-2xl border border-gray-100">
          <Shield size={16} className="text-blue-500" />
          <span className="text-xs font-bold text-gray-500 uppercase tracking-tighter">End-to-End Encrypted</span>
        </div>
      </header>

      {/* Messages Area */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 scrollbar-hide">
         <AnimatePresence initial={false}>
          {messages.map((msg, idx) => {
            const isMe = msg.senderId === user?.id;
            return (
              <motion.div
                key={msg.id || idx}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[75%] md:max-w-md ${isMe ? 'items-end' : 'items-start'} flex flex-col space-y-1`}>
                   <div className={`px-5 py-3 rounded-2xl text-sm font-medium shadow-sm transition-all
                    ${isMe 
                      ? 'bg-blue-600 text-white rounded-br-none' 
                      : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'}`}
                   >
                     {msg.content}
                   </div>
                   <div className="flex items-center space-x-1 px-1">
                     <span className="text-[10px] font-bold text-gray-400 uppercase">
                       {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                     </span>
                     {isMe && <CheckCheck size={12} className="text-blue-400" />}
                   </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </main>

      {/* Input Area */}
      <footer className="p-4 md:p-6 bg-white border-t border-gray-100">
        <form onSubmit={handleSend} className="max-w-4xl mx-auto flex items-center space-x-4">
           <div className="flex-1 relative group">
              <input 
                type="text" 
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type your clinical query here..."
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-6 py-4 text-sm font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center space-x-2">
                <button type="button" className="p-2 text-gray-400 hover:text-blue-500 transition-colors">
                   <Clock size={18} />
                </button>
              </div>
           </div>
           <button 
             type="submit"
             disabled={!inputText.trim()}
             className="bg-blue-600 text-white p-4 rounded-2xl shadow-lg shadow-blue-100 hover:shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-50 disabled:shadow-none"
           >
             <Send size={20} strokeWidth={2.5} />
           </button>
        </form>
        <p className="text-center text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] mt-3">
          Medical Consult Platform &bull; v1.0.4
        </p>
      </footer>
    </div>
  );
}
