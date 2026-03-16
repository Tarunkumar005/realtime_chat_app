import { useState, useRef, useEffect } from 'react';
import EmojiPicker from 'emoji-picker-react';
import { Smile, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function MessageInput({ onSendMessage, onTyping, onStopTyping }) {
  const [text, setText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    return () => clearTimeout(typingTimeoutRef.current);
  }, []);

  const handleChange = (e) => {
    setText(e.target.value);
    onTyping();
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      onStopTyping();
    }, 1500);
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (text.trim() === '') return;
    onSendMessage(text);
    setText('');
    setShowEmojiPicker(false);
    onStopTyping();
    clearTimeout(typingTimeoutRef.current);
  };

  const onEmojiClick = (emojiObject) => {
    setText(prev => prev + emojiObject.emoji);
  };

  return (
    <div className="relative p-4 bg-white/30 dark:bg-black/40 backdrop-blur-lg border-t border-white/20 dark:border-white/10">
      <AnimatePresence>
        {showEmojiPicker && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-20 left-4 z-50"
          >
            <EmojiPicker onEmojiClick={onEmojiClick} theme="auto" />
          </motion.div>
        )}
      </AnimatePresence>
      <form onSubmit={handleSend} className="flex items-end space-x-2">
        <button
          type="button"
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          className="p-3 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 bg-gray-100 dark:bg-gray-700 rounded-full transition-colors"
        >
          <Smile className="w-6 h-6" />
        </button>
        <textarea
          value={text}
          onChange={handleChange}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend(e);
            }
          }}
          placeholder="Type a message..."
          className="flex-1 max-h-32 min-h-[48px] py-3 px-4 bg-white/50 dark:bg-black/50 border border-white/20 dark:border-white/5 rounded-2xl resize-none focus:ring-2 focus:ring-blue-500 dark:text-white transition-all backdrop-blur-sm"
          rows="1"
        />
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="submit"
          className="p-3 text-white bg-blue-600 rounded-full hover:bg-blue-700 transition-colors shadow-md disabled:opacity-50"
          disabled={!text.trim()}
        >
          <Send className="w-6 h-6 ml-1" />
        </motion.button>
      </form>
    </div>
  );
}
