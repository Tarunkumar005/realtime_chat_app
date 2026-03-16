import { useState, useEffect, useRef, useContext } from 'react';
import { SocketContext } from '../context/SocketContext';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import { User, Phone, Video, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function ChatWindow({ selectedUser }) {
  const { user } = useContext(AuthContext);
  const { socket, onlineUsers } = useContext(SocketContext);
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (selectedUser) {
      fetchMessages();
    }
  }, [selectedUser]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    if (!socket) return;

    const handleReceiveMessage = (newMessage) => {
      // Add message if it belongs to current conversation
      if (
        (newMessage.senderId === selectedUser?._id && newMessage.receiverId === user?._id) ||
        (newMessage.senderId === user?._id && newMessage.receiverId === selectedUser?._id)
      ) {
        setMessages((prev) => {
          // Prevent duplicates from sender's own optimistic update if we broadcast globally
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

    const handleMessageDeleted = (messageId) => {
      setMessages((prev) => prev.filter(m => m._id !== messageId));
    };

    socket.on('receive_message', handleReceiveMessage);
    socket.on('user_typing', handleUserTyping);
    socket.on('user_stop_typing', handleUserStopTyping);
    socket.on('message_deleted', handleMessageDeleted);

    return () => {
      socket.off('receive_message', handleReceiveMessage);
      socket.off('user_typing', handleUserTyping);
      socket.off('user_stop_typing', handleUserStopTyping);
      socket.off('message_deleted', handleMessageDeleted);
    };
  }, [socket, selectedUser, user]);

  const fetchMessages = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/chat/${selectedUser._id}`);
      setMessages(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendMessage = async (text) => {
    if (!socket || !text.trim()) return;

    const messageData = {
      senderId: user._id,
      receiverId: selectedUser._id,
      message: text,
      messageType: 'text'
    };

    socket.emit('send_message', messageData);
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      await axios.delete(`${API_URL}/api/chat/${messageId}`);
      setMessages((prev) => prev.filter(m => m._id !== messageId));
      if (socket) {
        socket.emit('delete_message_event', { messageId, receiverId: selectedUser._id });
      }
    } catch (err) {
      console.error('Failed to delete message', err);
    }
  };

  const handleTyping = () => {
    if (socket) socket.emit('typing', { senderId: user._id, receiverId: selectedUser._id });
  };

  const handleStopTyping = () => {
    if (socket) socket.emit('stop_typing', { senderId: user._id, receiverId: selectedUser._id });
  };

  if (!selectedUser) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-white/10 dark:bg-black/10 backdrop-blur-md border-l border-white/20 dark:border-white/10 transition-colors">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }} 
          animate={{ opacity: 1, scale: 1 }} 
          className="text-center"
        >
          <div className="w-24 h-24 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <User className="w-12 h-12 text-blue-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Welcome to ChatApp</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Select a conversation to start messaging</p>
        </motion.div>
      </div>
    );
  }

  const isOnline = onlineUsers.includes(selectedUser._id);

  return (
    <div className="flex-1 flex flex-col bg-white/10 dark:bg-black/10 backdrop-blur-md border-l border-white/20 dark:border-white/10 transition-colors h-full">
      {/* Header */}
      <div className="p-4 bg-white/30 dark:bg-black/40 backdrop-blur-lg border-b border-white/20 dark:border-white/10 flex justify-between items-center shadow-sm z-10">
        <div className="flex items-center space-x-4">
          <div className="relative">
            {selectedUser.avatar ? (
              <img src={selectedUser.avatar} alt="Avatar" className="w-10 h-10 rounded-full object-cover" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                <User className="w-6 h-6 text-gray-500 dark:text-gray-400" />
              </div>
            )}
            {isOnline && <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">{selectedUser.username}</h3>
            <p className="text-xs text-green-500 font-medium">
              {isTyping ? 'Typing...' : isOnline ? 'Online' : <span className="text-gray-400">Offline</span>}
            </p>
          </div>
        </div>
        <div className="flex space-x-3 text-gray-500 dark:text-gray-400">
          <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"><Phone className="w-5 h-5" /></button>
          <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"><Video className="w-5 h-5" /></button>
          <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"><Info className="w-5 h-5" /></button>
        </div>
      </div>

      {/* Messages Window */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m) => (
          <MessageBubble 
            key={m._id} 
            message={m} 
            isOwn={m.senderId === user._id} 
            onDelete={handleDeleteMessage}
          />
        ))}

        <AnimatePresence>
          {isTyping && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex items-center space-x-2 text-gray-400 text-sm mt-4 ml-2"
            >
              <div className="flex space-x-1">
                <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6 }} className="w-2 h-2 bg-gray-400 rounded-full" />
                <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-2 h-2 bg-gray-400 rounded-full" />
                <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="w-2 h-2 bg-gray-400 rounded-full" />
              </div>
              <span>{selectedUser.username} is typing</span>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      <MessageInput 
        onSendMessage={handleSendMessage} 
        onTyping={handleTyping}
        onStopTyping={handleStopTyping}
      />
    </div>
  );
}
