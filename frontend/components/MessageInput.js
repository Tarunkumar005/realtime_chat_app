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
    onTyping?.();
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      onStopTyping?.();
    }, 1500);
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSendMessage(text);
    setText('');
    setShowEmojiPicker(false);
    onStopTyping?.();
    clearTimeout(typingTimeoutRef.current);
  };

  const onEmojiClick = (emojiObject) => {
    setText(prev => prev + emojiObject.emoji);
  };

  return (
    <div className=" w-full px-2 sm:px-4 py-2 sm:py-3 bg-white/30 dark:bg-black/40 backdrop-blur-lg border-t border-white/20 dark:border-white/10">

      {/* EMOJI PICKER */}
      <AnimatePresence>
        {showEmojiPicker && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="
              absolute bottom-16 sm:bottom-20 left-2 sm:left-4 z-50
              scale-90 sm:scale-100 origin-bottom-left
              max-w-[95vw] overflow-hidden
            "
          >
            <EmojiPicker onEmojiClick={onEmojiClick} theme="auto" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* INPUT */}
      <form onSubmit={handleSend} className="flex items-end gap-2">

        {/* EMOJI BTN */}
        <button
          type="button"
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          className="p-2 sm:p-3 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 bg-gray-100 dark:bg-gray-700 rounded-full transition"
        >
          <Smile className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        {/* TEXTAREA */}
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
          className="
            flex-1
            min-h-[40px] sm:min-h-[48px]
            max-h-28 sm:max-h-32
            text-sm sm:text-base
            py-2 sm:py-3 px-3 sm:px-4
            bg-white/50 dark:bg-black/50
            border border-white/20 dark:border-white/5
            rounded-2xl resize-none
            focus:ring-2 focus:ring-blue-500
            dark:text-white
            backdrop-blur-sm
          "
          rows="1"
        />

        {/* SEND BTN */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          type="submit"
          className="
            p-2 sm:p-3
            text-white bg-blue-600 rounded-full
            hover:bg-blue-700 transition
            shadow-md disabled:opacity-50
          "
          disabled={!text.trim()}
        >
          <Send className="w-5 h-5 sm:w-6 sm:h-6" />
        </motion.button>

      </form>
    </div>
  );
}