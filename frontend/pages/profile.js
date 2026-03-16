import { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import Link from 'next/link';
import axios from 'axios';
import { ArrowLeft, User, LogOut } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function Profile() {
  const { user, setUser, logout, loading } = useContext(AuthContext);
  const [username, setUsername] = useState('');
  const [avatar, setAvatar] = useState('');
  const [message, setMessage] = useState('');
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.push('/login');
    if (user) {
      setUsername(user.username);
      setAvatar(user.avatar || '');
    }
  }, [user, loading, router]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(`${API_URL}/api/auth/profile`, { username, avatar });
      setUser(res.data);
      setMessage('Profile updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error(error);
      setMessage('Failed to update profile.');
    }
  };

  if (loading || !user) return <div className="min-h-screen bg-gray-100 dark:bg-gray-900"></div>;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="w-full max-w-md w-full">
        <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-500 mb-6 dark:text-blue-400">
          <ArrowLeft className="w-5 h-5 mr-2" /> Back to Chat
        </Link>
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden"
        >
          <div className="bg-blue-600 px-6 py-8 text-center">
            {avatar ? (
              <img src={avatar} alt="Profile" className="w-24 h-24 rounded-full mx-auto border-4 border-white dark:border-gray-800 object-cover" />
            ) : (
              <div className="w-24 h-24 rounded-full mx-auto border-4 border-white dark:border-gray-800 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                <User className="w-12 h-12 text-gray-500 dark:text-gray-400" />
              </div>
            )}
            <h2 className="mt-4 text-2xl font-bold text-white">{user.username}</h2>
            <p className="text-blue-100">{user.email}</p>
          </div>
          <div className="px-6 py-6">
            {message && (
              <div className={`p-3 rounded mb-4 text-sm text-center ${message.includes('success') ? 'bg-green-100 text-green-700 dark:bg-green-900/30' : 'bg-red-100 text-red-700 dark:bg-red-900/30'}`}>
                {message}
              </div>
            )}
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Username</label>
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="mt-1 block w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Avatar URL</label>
                <input 
                  type="text" 
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  placeholder="https://example.com/avatar.jpg"
                  className="mt-1 block w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit" 
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Save Changes
              </motion.button>
            </form>
            <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-6">
              <button 
                onClick={logout}
                className="w-full flex justify-center items-center py-2 px-4 border border-red-300 rounded-lg shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50 dark:bg-gray-800 dark:text-red-400 dark:border-red-500/50 dark:hover:bg-gray-700 transition-colors"
              >
                <LogOut className="w-4 h-4 mr-2" /> Logout
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
