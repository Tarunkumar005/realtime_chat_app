import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { SocketContext } from '../context/SocketContext';
import axios from 'axios';
import { Search, User as UserIcon, MessageSquare, Users, UserPlus } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function Sidebar({ onSelectUser, selectedUser }) {
  const { user } = useContext(AuthContext);
  const { socket, onlineUsers } = useContext(SocketContext);
  
  const [activeTab, setActiveTab] = useState('chats'); // 'chats', 'requests', 'search'
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (user) {
      if (activeTab === 'chats') fetchFriends();
      if (activeTab === 'requests') fetchRequests();
      if (activeTab === 'search') fetchAllUsers();
    }
  }, [user, activeTab]);

  useEffect(() => {
      if (!socket || !user) return;

      socket.on('friend_request_received', () => {
          if (activeTab === 'requests') fetchRequests();
      });

      socket.on('friend_request_accepted', () => {
          if (activeTab === 'chats') fetchFriends();
          if (activeTab === 'requests') fetchRequests();
      });
      
      socket.on('friend_request_rejected', () => {
          if (activeTab === 'requests') fetchRequests();
      });

      return () => {
          socket.off('friend_request_received');
          socket.off('friend_request_accepted');
          socket.off('friend_request_rejected');
      }
  }, [socket, user, activeTab]);

  const fetchFriends = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/friends/${user._id}`);
      setFriends(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchRequests = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/friends/requests/${user._id}`);
      setRequests(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAllUsers = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/auth/users`);
      // Filter out self and current friends
      const friendIds = friends.map(f => f._id);
      const filtered = res.data.filter(u => u._id !== user._id && !friendIds.includes(u._id));
      setSearchResults(filtered);
    } catch (err) {
      console.error(err);
    }
  };

  const sendRequest = async (receiverId) => {
    try {
      await axios.post(`${API_URL}/api/friends/request`, { senderId: user._id, receiverId });
      if (socket) socket.emit('send_friend_request', { senderId: user._id, receiverId });
      alert('Request sent!');
    } catch (err) {
      alert(err.response?.data?.message || 'Error sending request');
    }
  };

  const acceptRequest = async (requestId, senderId) => {
      try {
          await axios.post(`${API_URL}/api/friends/accept`, { requestId });
          if(socket) socket.emit('accept_friend_request', { senderId, receiverId: user._id });
          fetchRequests();
      } catch (err) {
          console.error(err);
      }
  };

  const rejectRequest = async (requestId, senderId) => {
      try {
          await axios.post(`${API_URL}/api/friends/reject`, { requestId });
          if(socket) socket.emit('reject_friend_request', { senderId, receiverId: user._id });
          fetchRequests();
      } catch (err) {
          console.error(err);
      }
  };

  const renderTabContent = () => {
      if (activeTab === 'chats') {
          return friends.length === 0 ? (
              <div className="text-center p-8 text-gray-500 text-sm">No friends yet. Find them in the search tab!</div>
          ) : (
            friends.map((u) => {
              const isOnline = onlineUsers.includes(u._id);
              const isSelected = selectedUser?._id === u._id;
              return (
                <motion.div
                  key={u._id}
                  whileHover={{ backgroundColor: 'rgba(59, 130, 246, 0.05)' }}
                  onClick={() => onSelectUser(u)}
                  className={`flex items-center p-4 cursor-pointer border-b border-gray-200 dark:border-zinc-800 transition-colors ${
                    isSelected ? 'bg-blue-50 dark:bg-zinc-800' : 'hover:bg-gray-50 dark:hover:bg-zinc-800/50'
                  }`}
                >
                  <div className="relative">
                    {u.avatar ? (
                      <img src={u.avatar} alt="Avatar" className="w-12 h-12 rounded-full object-cover" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-zinc-700 flex items-center justify-center">
                        <UserIcon className="w-7 h-7 text-gray-400" />
                      </div>
                    )}
                    {isOnline && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-zinc-900 rounded-full"></div>
                    )}
                  </div>
                  <div className="ml-4 flex-1">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{u.username}</h4>
                  </div>
                </motion.div>
              );
            })
          );
      }

      if (activeTab === 'requests') {
          return requests.length === 0 ? (
              <div className="text-center p-8 text-gray-500 text-sm">No pending requests</div>
          ) : (
              requests.map((req) => (
                  <div key={req._id} className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-zinc-800">
                      <div className="flex items-center">
                         {req.sender.avatar ? (
                            <img src={req.sender.avatar} alt="Avatar" className="w-10 h-10 rounded-full object-cover mr-3" />
                         ) : (
                            <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-zinc-700 flex items-center justify-center mr-3">
                                <UserIcon className="w-5 h-5 text-gray-400" />
                            </div>
                         )}
                         <span className="text-sm font-semibold dark:text-gray-100">{req.sender.username}</span>
                      </div>
                      <div className="flex gap-2">
                          <button onClick={() => acceptRequest(req._id, req.sender._id)} className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-md">Accept</button>
                          <button onClick={() => rejectRequest(req._id, req.sender._id)} className="px-3 py-1 bg-zinc-600 hover:bg-zinc-700 text-white text-xs rounded-md">Reject</button>
                      </div>
                  </div>
              ))
          );
      }

      if (activeTab === 'search') {
          const filtered = searchResults.filter(u => u.username.toLowerCase().includes(search.toLowerCase()));
          return (
              <>
                 <div className="p-4 border-b border-gray-200 dark:border-zinc-800">
                    <div className="relative">
                        <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Find new friends..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border rounded-full bg-gray-50 dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 focus:outline-none focus:border-blue-500 dark:text-white transition-all shadow-sm focus:ring-1 focus:ring-blue-500"
                        />
                    </div>
                </div>
                {filtered.map(u => (
                     <div key={u._id} className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-zinc-800">
                     <div className="flex items-center">
                        {u.avatar ? (
                           <img src={u.avatar} alt="Avatar" className="w-10 h-10 rounded-full object-cover mr-3" />
                        ) : (
                           <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-zinc-700 flex items-center justify-center mr-3">
                               <UserIcon className="w-5 h-5 text-gray-400" />
                           </div>
                        )}
                        <span className="text-sm font-semibold dark:text-gray-100">{u.username}</span>
                     </div>
                     <button onClick={() => sendRequest(u._id)} className="p-2 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-800 transition-colors rounded-full text-blue-600 dark:text-blue-400 items-center justify-center flex">
                         <UserPlus className="w-4 h-4" />
                     </button>
                 </div>
                ))}
            </>
          );
      }
  };

  return (
    <div className="w-full md:w-80 bg-white dark:bg-zinc-950 border-r border-gray-200 dark:border-zinc-800 flex flex-col h-full transition-colors">
      <div className="p-4 border-b border-gray-200 dark:border-zinc-800 flex items-center justify-between">
        <Link href="/profile" className="flex items-center space-x-3 hover:opacity-80 transition-opacity cursor-pointer">
          {user?.avatar ? (
            <img src={user.avatar} alt="Profile" className="w-10 h-10 rounded-full object-cover" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <UserIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          )}
          <span className="font-semibold text-gray-900 dark:text-gray-100">{user?.username}</span>
        </Link>
      </div>
      
      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-zinc-800">
          <button 
             onClick={() => setActiveTab('chats')} 
             className={`flex-1 py-3 flex justify-center items-center text-sm font-medium transition-colors ${activeTab === 'chats' ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
          >
             <MessageSquare className="w-4 h-4 mr-2" />
             Chats
          </button>
          <button 
             onClick={() => setActiveTab('requests')} 
             className={`flex-1 py-3 flex justify-center items-center text-sm font-medium transition-colors ${activeTab === 'requests' ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'} relative`}
          >
             <Users className="w-4 h-4 mr-2" />
             Requests
             {requests.length > 0 && (
                 <span className="absolute top-2 right-4 w-2 h-2 bg-red-500 rounded-full"></span>
             )}
          </button>
          <button 
             onClick={() => setActiveTab('search')} 
             className={`flex-1 py-3 flex justify-center items-center text-sm font-medium transition-colors ${activeTab === 'search' ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
          >
             <Search className="w-4 h-4 mr-2" />
             Search
          </button>
      </div>

      <div className="flex-1 overflow-y-auto">
         <AnimatePresence mode="wait">
             <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
             >
                {renderTabContent()}
             </motion.div>
         </AnimatePresence>
      </div>
    </div>
  );
}
