import { motion } from 'framer-motion';
import { format } from 'timeago.js';
import { MoreVertical, Trash } from 'lucide-react';
import { useState } from 'react';

export default function MessageBubble({ message, isOwn, onDelete }) {
  const [showOptions, setShowOptions] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className={`flex w-full mt-4 space-x-3 max-w-xl ${isOwn ? 'ml-auto justify-end' : ''}`}
    >
      {!isOwn && (
        <div className="flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-700"></div>
        </div>
      )}
      
      <div className={`group relative flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
        <div 
          className={`px-4 py-2 rounded-2xl relative ${
            isOwn 
              ? 'bg-blue-600/90 text-white rounded-br-none backdrop-blur-md shadow-lg border border-blue-400/30' 
              : 'bg-white/60 dark:bg-black/60 text-gray-900 dark:text-gray-100 border border-white/20 dark:border-white/10 rounded-bl-none shadow-sm backdrop-blur-md'
          }`}
        >
          <p className="text-sm whitespace-pre-wrap">{message.message}</p>
        </div>
        
        <span className="text-xs text-gray-500 mt-1 px-1">
          {format(message.createdAt)}
        </span>
        
        {isOwn && (
          <div className="absolute top-0 -left-10 opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
              onClick={() => setShowOptions(!showOptions)}
              className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
            {showOptions && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute top-8 left-0 z-10 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1"
              >
                <button 
                  onClick={() => { onDelete(message._id); setShowOptions(false); }}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50 dark:hover:bg-gray-700/50 flex items-center"
                >
                  <Trash className="w-4 h-4 mr-2" /> Delete
                </button>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
