"use client";

import { useEffect, useRef, useState } from "react";
import supabase from "@/utils/Supabase";
import { User as UserIcon } from "lucide-react";
import Image from "next/image";

interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
}

type MessagePageProps = {
  userData: User | null;
};

type Message = {
  id: number;
  user_id: number;
  sender_id: number;
  sender_type: "user" | "admin";
  content: string;
  created_at: string;
};

export default function MessagePage({ userData }: MessagePageProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Fetch & subscribe to messages
  useEffect(() => {
    if (!userData) return;

    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("user_id", userData.id)
        .order("created_at", { ascending: true });

      if (!error && data) setMessages(data as Message[]);
    };

    fetchMessages();

    const channel = supabase
      .channel("realtime-messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `user_id=eq.${userData.id}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userData]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !userData) return;

    setIsSending(true);

    await supabase.from("messages").insert([
      {
        user_id: userData.id,
        sender_id: userData.id,
        sender_type: "user",
        content: newMessage,
      },
    ]);

    setNewMessage("");
    setIsSending(false);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString("en-PH", {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    });
  };

  const formatDateHeader = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-PH", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
  };

  if (!userData) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-600">
        No user data found. Please log in again.
      </div>
    );
  }

  let lastDate = "";

  return (
    <div className="flex items-center justify-center px-2">
      {/* Chat Container */}
      <div className="w-full max-w-md md:max-w-4xl h-[calc(100vh-4rem)] bg-white rounded-2xl shadow-lg flex flex-col md:flex-row overflow-hidden border">
        {/* User Info (Hidden on mobile) */}
        <div className="hidden md:block w-1/3 border-r bg-gray-50 p-6 overflow-y-auto">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-gray-300 flex items-center justify-center mb-4">
              <UserIcon className="w-8 h-8 text-gray-700" />
            </div>
            <h2 className="text-base font-semibold mb-1">
              {userData.first_name} {userData.last_name}
            </h2>
            <p className="text-xs text-gray-600 mb-6">{userData.email}</p>
            <div className="text-xs text-gray-700 space-y-1">
              <p>
                This is your <span className="font-medium">messaging page</span>
                .
              </p>
              <p>You can send messages to the admin.</p>
              <p className="italic text-gray-500 mt-2">
                Admin will reply here in realtime.
              </p>
            </div>
          </div>
        </div>

        {/* Chat Section */}
        <div className="flex-1 flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center p-3 border-b bg-gray-900 text-white">
            <UserIcon className="w-5 h-5 mr-2" />
            <h1 className="text-sm font-semibold truncate">Chat with Admin</h1>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3 bg-gray-50 text-sm pb-20">
            {messages.map((msg) => {
              const msgDate = new Date(msg.created_at).toDateString();
              const showDate = msgDate !== lastDate;
              lastDate = msgDate;

              const isUser = msg.sender_type === "user";

              return (
                <div key={msg.id}>
                  {showDate && (
                    <div className="text-center text-[10px] text-gray-500 my-2">
                      {formatDateHeader(msg.created_at)}
                    </div>
                  )}

                  <div
                    className={`flex items-end mb-1 ${
                      isUser ? "justify-end" : "justify-start"
                    }`}
                  >
                    {!isUser && (
                      <div className="flex-shrink-0 mr-2">
                        <div className="w-7 h-7 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden">
                          <Image
                            src="/logo/logo-white-bg.png"
                            alt="Admin"
                            width={28} 
                            height={28}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                    )}

                    <div
                      className={`max-w-[75%] md:max-w-[70%] px-3 py-2 rounded-lg shadow-sm ${
                        isUser
                          ? "bg-blue-500 text-white"
                          : "bg-gray-200 text-gray-900"
                      }`}
                    >
                      <p>{msg.content}</p>
                      <span className="block text-[10px] text-gray-400 mt-1">
                        {formatDate(msg.created_at)}
                      </span>
                    </div>

                    {isUser && (
                      <div className="flex-shrink-0 ml-2">
                        <div className="w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center">
                          <UserIcon className="w-4 h-4 text-white" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t flex gap-2 bg-white">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="flex-1 border rounded-lg p-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Type a message..."
              disabled={isSending}
            />
            <button
              onClick={sendMessage}
              disabled={!newMessage.trim() || isSending}
              className={`px-4 rounded-lg text-sm transition ${
                !newMessage.trim() || isSending
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-blue-500 text-white hover:bg-blue-600 cursor-pointer"
              }`}
            >
              {isSending ? "Sending..." : "Send"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
