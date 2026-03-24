import { motion } from 'framer-motion';
import { format } from 'timeago.js';
import { MoreVertical, Trash } from 'lucide-react';
import { useState } from 'react';

export default function MessageBubble({ message, isOwn, onDelete }) {
  const [showOptions, setShowOptions] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className={`
        flex w-full mt-2 sm:mt-4 px-1 sm:px-0
        ${isOwn ? 'justify-end' : 'justify-start'}
      `}
    >
      {/* Avatar */}
      {!isOwn && (
        <div className="mr-2 sm:mr-3 flex-shrink-0">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gray-300 dark:bg-gray-700"></div>
        </div>
      )}

      <div className={`group relative flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>

        {/* ✅ FLUID BUBBLE */}
        <div
          className={`
            px-3 sm:px-4 py-2 rounded-2xl relative
            break-words
            backdrop-blur-md shadow-lg

            /* 🔥 KEY PART (fluid width) */
            max-w-[clamp(220px,70vw,650px)]

            ${isOwn
              ? 'bg-blue-600/90 text-white rounded-br-none border border-blue-400/30'
              : 'bg-white/60 dark:bg-black/60 text-gray-900 dark:text-gray-100 border border-white/20 dark:border-white/10 rounded-bl-none'
            }
          `}
        >
          <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">
            {message.message}
          </p>
        </div>

        {/* Time */}
        <span className="text-[10px] sm:text-xs text-gray-500 mt-1 px-1">
          {format(message.createdAt)}
        </span>

        {/* Options */}
        {isOwn && (
          <div
            className="
              absolute top-0 -left-7 sm:-left-10
              opacity-100 sm:opacity-0 sm:group-hover:opacity-100
              transition-opacity
            "
          >
            <button
              onClick={() => setShowOptions(!showOptions)}
              className="p-1 sm:p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showOptions && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="
                  absolute top-8 left-0 z-10
                  bg-white dark:bg-gray-800
                  rounded-lg shadow-lg
                  border border-gray-200 dark:border-gray-700
                  py-1
                "
              >
                <button
                  onClick={() => {
                    onDelete(message._id);
                    setShowOptions(false);
                  }}
                  className="w-full text-left px-3 sm:px-4 py-2 text-xs sm:text-sm text-red-600 hover:bg-gray-50 dark:hover:bg-gray-700/50 flex items-center"
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