import { useState, useEffect, useRef, useContext } from 'react';
import { SocketContext } from '../context/SocketContext';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import { User, Phone, Video, Info, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function ChatWindow({ selectedUser, onBack }) {
  const { user } = useContext(AuthContext);
  const { socket, onlineUsers } = useContext(SocketContext);

  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (selectedUser) fetchMessages();
  }, [selectedUser]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    if (!socket) return;

    const handleReceiveMessage = (newMessage) => {
      if (
        (newMessage.senderId === selectedUser?._id && newMessage.receiverId === user?._id) ||
        (newMessage.senderId === user?._id && newMessage.receiverId === selectedUser?._id)
      ) {
        setMessages((prev) => {
          if (prev.find(m => m._id === newMessage._id)) return prev;
          return [...prev, newMessage];
        });
      }
    };

    const handleUserTyping = (senderId) => {
      if (senderId === selectedUser?._id) setIsTyping(true);
    };

    const handleUserStopTyping = (senderId) => {
      if (senderId === selectedUser?._id) setIsTyping(false);
    };

    socket.on('receive_message', handleReceiveMessage);
    socket.on('user_typing', handleUserTyping);
    socket.on('user_stop_typing', handleUserStopTyping);

    return () => socket.removeAllListeners();
  }, [socket, selectedUser, user]);

  const fetchMessages = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/chat/${selectedUser._id}`);
      setMessages(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendMessage = (text) => {
    if (!socket || !text.trim()) return;

    socket.emit('send_message', {
      senderId: user._id,
      receiverId: selectedUser._id,
      message: text,
      messageType: 'text'
    });
  };

  const handleTyping = () => {
    socket?.emit('typing', { senderId: user._id, receiverId: selectedUser._id });
  };

  const handleStopTyping = () => {
    socket?.emit('stop_typing', { senderId: user._id, receiverId: selectedUser._id });
  };

  if (!selectedUser) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white/10 dark:bg-black/10 backdrop-blur-md">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-500">
          Select a chat
        </h2>
      </div>
    );
  }

  const isOnline = onlineUsers.includes(selectedUser._id);

  return (
    <div className="flex-1 flex flex-col rounded-2xl min-w-full bg-white/10 dark:bg-black/10 backdrop-blur-md border-l border-white/20 dark:border-white/10">

      {/* HEADER */}
      <div className="p-3 rounded-t-2xl sm:p-4 bg-white/30 dark:bg-black/40 backdrop-blur-lg border-b border-white/20 dark:border-white/10 flex items-center justify-between z-10">

        <div className="flex items-center gap-3 min-w-0">

          <button
            onClick={onBack}
            className="md:hidden p-2 rounded-full hover:bg-white/40 dark:hover:bg-white/10"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gray-300 rounded-full"></div>

          <div className="truncate">
            <h3 className="text-sm sm:text-base font-semibold truncate">
              {selectedUser.username}
            </h3>
            <p className="text-xs text-gray-700">
              {isTyping ? 'Typing...' : isOnline ? 'Online' : 'Offline'}
            </p>
          </div>
        </div>

        <div className="hidden sm:flex gap-3">
          <Phone className="w-5 h-5" />
          <Video className="w-5 h-5" />
          <Info className="w-5 h-5" />
        </div>
      </div>

      {/* MESSAGES */}
      <div className="flex-1 overflow-y-auto px-2 sm:px-4 py-3 space-y-3 w-full">

        {messages.map((m) => (
          <MessageBubble
            key={m._id}
            message={m}
            isOwn={m.senderId === user._id}
          />
        ))}

        <AnimatePresence>
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-xs text-gray-400 ml-2"
            >
              {selectedUser.username} is typing...
            </motion.div>
          )}
        </AnimatePresence>

        {/* 👇 FIX: space for input */}
        <div className="h-20" />
        <div ref={messagesEndRef} />
      </div>

      {/* INPUT (STICKY FIX) */}
      <div className="sticky bottom-0 z-10 rounded-b-2xl">
        <MessageInput
          onSendMessage={handleSendMessage}
          onTyping={handleTyping}
          onStopTyping={handleStopTyping}
        />
      </div>

    </div>
  );
}