"use client";

import { useEffect, useRef, useState } from "react";
import supabase from "@/utils/Supabase";
import { User as UserIcon } from "lucide-react";
import Image from "next/image";


type AdminMessageProps = {
  adminData: {
    id: number;
    name: string;
    email: string;
    role: string;
  } | null;
};

type UserData = {
  id: number;
  first_name: string;
  middle_name?: string | null;
  last_name: string;
  email: string;
};

type Message = {
  id: number;
  user_id: number;
  sender_id: number;
  sender_type: "user" | "admin";
  content: string;
  created_at: string;
};

const AdminMessage: React.FC<AdminMessageProps> = ({ adminData }) => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Fetch approved users
  useEffect(() => {
    const fetchUsers = async () => {
      const { data, error } = await supabase
        .from("users")
        .select("id, first_name, middle_name, last_name, email")
        .eq("approval_status", "Approved");

      if (!error && data) setUsers(data);
    };
    fetchUsers();
  }, []);

  // Fetch messages for selected user
  useEffect(() => {
    if (!selectedUser || !adminData) return;

    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("user_id", selectedUser.id)
        .order("created_at", { ascending: true });

      if (!error && data) setMessages(data);
    };

    fetchMessages();

    // Real-time subscription
    const channel = supabase
      .channel("messages-channel")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          const msg: Message = payload.new as Message;
          if (msg.user_id === selectedUser.id) {
            setMessages((prev) => [...prev, msg]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedUser, adminData]);

  // Send message
  const sendMessage = async () => {
    if (!newMessage.trim() || !adminData || !selectedUser) return;

    setIsSending(true);
    const { error } = await supabase.from("messages").insert([
      {
        user_id: selectedUser.id,
        sender_id: adminData.id,
        sender_type: "admin",
        content: newMessage.trim(),
      },
    ]);

    if (!error) setNewMessage("");
    setIsSending(false);
  };

  // Helpers
  const getFullName = (u: UserData) =>
    [u.first_name, u.middle_name, u.last_name].filter(Boolean).join(" ");

  const formatDateHeader = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Top users scroll */}
      <div className="flex overflow-x-auto overflow-y-hidden border-b p-4 space-x-6 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
        {users.map((u) => (
          <div
            key={u.id}
            onClick={() => setSelectedUser(u)}
            className={`flex-shrink-0 flex flex-col items-center cursor-pointer min-w-[4rem] ${
              selectedUser?.id === u.id ? "text-blue-600" : "text-gray-600"
            }`}
          >
            <div
              className={`w-14 h-14 rounded-full flex items-center justify-center ${
                selectedUser?.id === u.id
                  ? "border-2 border-blue-500 bg-blue-100"
                  : "bg-gray-200"
              }`}
            >
              <UserIcon className="w-7 h-7" />
            </div>
            {/* First + Last name stacked */}
            <span className="text-xs mt-1 text-center leading-tight">
              {u.first_name}
            </span>
            <span className="text-xs text-center leading-tight">
              {u.last_name}
            </span>
          </div>
        ))}
      </div>

      {/* Chat Section */}
      {selectedUser ? (
        <div className="flex-1 flex flex-col h-[calc(100vh-120px)]">
          {/* Fixed header */}
          <div className="flex items-center p-3 border-b bg-gray-900 text-white">
            <UserIcon className="w-5 h-5 mr-2" />
            <h1 className="text-sm font-semibold truncate">
              Chat with {getFullName(selectedUser)}
            </h1>
          </div>

          {/* Scrollable messages */}
          <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3 bg-gray-50 text-sm scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
            {messages.map((msg, idx) => {
              const msgDate = new Date(msg.created_at).toDateString();
              const prevDate =
                idx > 0
                  ? new Date(messages[idx - 1].created_at).toDateString()
                  : null;
              const showDate = msgDate !== prevDate;
              const isAdmin = msg.sender_type === "admin";

              return (
                <div key={msg.id}>
                  {showDate && (
                    <div className="text-center text-[10px] text-gray-500 my-2">
                      {formatDateHeader(msg.created_at)}
                    </div>
                  )}

                  <div
                    className={`flex items-end mb-1 ${
                      isAdmin ? "justify-end" : "justify-start"
                    }`}
                  >
                    {/* User Avatar */}
                    {!isAdmin && (
                      <div className="flex-shrink-0 mr-2">
                        <div className="w-7 h-7 rounded-full bg-gray-300 flex items-center justify-center shadow">
                          <UserIcon className="w-4 h-4 text-gray-700" />
                        </div>
                      </div>
                    )}

                    {/* Message Bubble */}
                    <div
                      className={`max-w-[75%] md:max-w-[70%] px-3 py-2 rounded-lg shadow-sm ${
                        isAdmin
                          ? "bg-blue-500 text-white"
                          : "bg-gray-200 text-gray-900"
                      }`}
                    >
                      <p>{msg.content}</p>
                      <span className="block text-[10px] text-gray-400 mt-1">
                        {formatDate(msg.created_at)}
                      </span>
                    </div>

                    {/* Admin Avatar */}
                    {isAdmin && (
                      <div className="flex-shrink-0 ml-2">
                        <div className="w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center overflow-hidden shadow">
                          <Image
                            src="/logo/logo-dark-bg.png"
                            alt="Admin"
                            className="w-full h-full object-cover"
                            fill
                            priority
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Always scroll to bottom */}
            <div ref={messagesEndRef} />
          </div>

          {/* Fixed input */}
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
      ) : (
        <div className="flex-1 flex items-center justify-center text-gray-500 text-sm px-4 text-center">
          Select a user above to start messaging
        </div>
      )}
    </div>
  );
};

export default AdminMessage;
