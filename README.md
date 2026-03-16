# Real-Time Chat Application

A modern, full-stack real-time chat application built with Next.js, Node.js, Socket.IO, and MongoDB.

## Features Let's check:
- **Real-time messaging** with typing indicators and online statuses
- **Authentication system** using JWT
- **Modern UI** with Framer Motion animations, dark mode support, and an animated glassmorphism background
- **Emoji Picker** integrated into the chat window
- **Responsive** mobile and desktop views

## 1. Full Project Folder Structure
```
realtime_chat_app/
├── backend/
│   ├── controllers/      # Route logic (authController, chatController)
│   ├── middleware/       # JWT auth middleware
│   ├── models/           # Mongoose schemas (User, Message)
│   ├── routes/           # Express routes (auth, chat)
│   ├── socket/           # Real-time WebSocket handlers
│   ├── .env              # Backend environment variables
│   ├── package.json      # Backend dependencies
│   └── server.js         # Entry point honoring DB & Socket.io
└── frontend/
    ├── components/       # UI (Sidebar, ChatWindow, MessageBubble, MessageInput)
    ├── context/          # React contexts (AuthContext, SocketContext)
    ├── pages/            # Next.js routes (login, register, profile, _app, index)
    ├── styles/           # Tailwind globals.css
    ├── .env.local        # Frontend environment variables
    └── package.json      # Frontend dependencies
```

## 2. Step-by-Step Setup & 3. Installation Commands

**Prerequisites:** Ensure you have Node.js and MongoDB installed and running on your machine.

1. **Clone or Navigate to the App directory:**
   ```bash
   cd realtime_chat_app
   ```

2. **Setup Backend:**
   ```bash
   cd backend
   npm install
   # Start the Express server
   npm start
   # Server will run on http://localhost:5000
   ```

3. **Setup Frontend:**
   ```bash
   cd ../frontend
   npm install
   # Start the Next.js frontend
   npm run dev
   # App will be accessible at http://localhost:3002
   ```

## 4-7. Code References
- **Backend Code:** Check `backend/server.js`, controllers, and routes.
- **Frontend Code:** Check `frontend/pages` and `frontend/components`.
- **Socket.IO Setup:** Implemented cleanly in `backend/socket/index.js` and `frontend/context/SocketContext.js`.
- **MongoDB Connection:** Referenced in `backend/server.js` using Mongoose.

## 8. Environment Variables Example

**backend/.env**
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/chat_app
JWT_SECRET=super_secret_jwt_key
CLIENT_URL=http://localhost:3002
```

**frontend/.env.local**
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

## 9. Instructions to Run the Project
1. Start your local MongoDB server (if not running natively, use MongoDB Compass or Docker).
2. Open terminal and run `node server.js` inside the `backend` folder.
3. Open another terminal and run `npm run dev` inside the `frontend` folder.
4. Visit `http://localhost:3002` in your browser. Create two accounts in different tabs to see real-time updates!

## 10. Example UI Styling
The frontend utilizes a clean card-based layout using Tailwind CSS. It supports seamless transitions via Framer Motion for message bubbles and modal popups. The entire app relies on dark-mode standard utilities (`dark:bg-gray-800`, `dark:text-white`).
