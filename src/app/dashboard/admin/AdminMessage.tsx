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
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Top users scroll */}
      <div className="flex overflow-x-auto border-b p-3 space-x-5 bg-white shadow-sm scrollbar-thin scrollbar-thumb-gray-300">
        {users.map((u) => (
          <div
            key={u.id}
            onClick={() => setSelectedUser(u)}
            className={`flex-shrink-0 flex flex-col items-center cursor-pointer transition-all ${
              selectedUser?.id === u.id
                ? "text-blue-600"
                : "text-gray-600 hover:text-blue-500"
            }`}
          >
            <div
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
                selectedUser?.id === u.id
                  ? "border-2 border-blue-500 bg-blue-50 shadow-md"
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              <UserIcon className="w-6 h-6" />
            </div>
            <span className="text-xs mt-1 font-medium">{u.first_name}</span>
            <span className="text-xs">{u.last_name}</span>
          </div>
        ))}
      </div>

      {/* Chat Section */}
      {selectedUser ? (
        <div className="flex-1 flex flex-col h-[calc(100vh-130px)]">
          {/* Fixed header */}
          <div className="flex items-center p-3 border-b bg-blue-600 text-white shadow-md">
            <UserIcon className="w-5 h-5 mr-2" />
            <h1 className="text-sm font-semibold truncate">
              Chat with {getFullName(selectedUser)}
            </h1>
          </div>

          {/* Scrollable messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-gray-50 text-sm scrollbar-thin scrollbar-thumb-gray-300">
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
                    <div className="text-center text-[11px] text-gray-500 my-2">
                      {formatDateHeader(msg.created_at)}
                    </div>
                  )}

                  <div
                    className={`flex items-end gap-2 mb-1 ${
                      isAdmin ? "justify-end" : "justify-start"
                    }`}
                  >
                    {/* User Avatar */}
                    {!isAdmin && (
                      <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center shadow">
                        <UserIcon className="w-4 h-4 text-gray-700" />
                      </div>
                    )}

                    {/* Message Bubble */}
                    <div
                      className={`max-w-[80%] md:max-w-[65%] px-4 py-2 rounded-2xl shadow-sm ${
                        isAdmin
                          ? "bg-blue-500 text-white rounded-br-none"
                          : "bg-white border border-gray-200 text-gray-900 rounded-bl-none"
                      }`}
                    >
                      <p className="leading-snug">{msg.content}</p>
                      <span
                        className={`block text-[10px] mt-1 ${
                          isAdmin ? "text-blue-100" : "text-gray-400"
                        }`}
                      >
                        {formatDate(msg.created_at)}
                      </span>
                    </div>

                    {isAdmin && (
                      <div className="flex-shrink-0 ml-2">
                        <div className="relative w-7 h-7 rounded-full overflow-hidden border border-blue-400 shadow">
                          <Image
                            src="/logo/logo-white-bg.png"
                            alt="Admin"
                            fill
                            sizes="28px"
                            className="object-cover"
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
          <div className="p-3 border-t flex gap-2 bg-white sticky bottom-0">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="flex-1 border border-gray-300 rounded-full p-2 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Type a message..."
              disabled={isSending}
            />
            <button
              onClick={sendMessage}
              disabled={!newMessage.trim() || isSending}
              className={`px-4 py-2 rounded-full text-sm transition font-medium ${
                !newMessage.trim() || isSending
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                  : "bg-blue-500 text-white hover:bg-blue-600"
              }`}
            >
              {isSending ? "..." : "Send"}
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
