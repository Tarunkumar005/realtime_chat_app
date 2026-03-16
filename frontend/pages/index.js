import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useRouter } from 'next/router';
import Sidebar from '../components/Sidebar';
import ChatWindow from '../components/ChatWindow';
import { motion } from 'framer-motion';

export default function Home() {
  const { user, loading } = useContext(AuthContext);
  const router = useRouter();
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-transparent">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden p-4 md:p-8 bg-transparent">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-[1600px] mx-auto flex h-full shadow-2xl overflow-hidden glass rounded-3xl"
      >
        <Sidebar selectedUser={selectedUser} onSelectUser={setSelectedUser} />
        <div className={`flex-1 ${!selectedUser ? 'hidden md:flex' : 'flex'}`}>
          <ChatWindow selectedUser={selectedUser} />
        </div>
      </motion.div>
    </div>
  );
}
