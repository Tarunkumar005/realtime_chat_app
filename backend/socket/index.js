const Message = require('../models/Message');

module.exports = (io) => {
  const userSocketMap = {}; // Maps userId to socketId

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // When a user logs in and opens the app
    socket.on('register_user', (userId) => {
      userSocketMap[userId] = socket.id;
      io.emit('online_users', Object.keys(userSocketMap));
    });

    // Send and receive messages
    socket.on('send_message', async (data) => {
      const { senderId, receiverId, message, messageType } = data;
      
      const newMessage = new Message({
        senderId,
        receiverId,
        message,
        messageType
      });
      await newMessage.save();

      const receiverSocketId = userSocketMap[receiverId];
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('receive_message', newMessage);
      }
      
      // Also send back to sender for optimistic UI validation
      io.to(socket.id).emit('receive_message', newMessage);
    });

    socket.on('typing', ({ senderId, receiverId }) => {
      const receiverSocketId = userSocketMap[receiverId];
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('user_typing', senderId);
      }
    });

    socket.on('stop_typing', ({ senderId, receiverId }) => {
       const receiverSocketId = userSocketMap[receiverId];
       if (receiverSocketId) {
         io.to(receiverSocketId).emit('user_stop_typing', senderId);
       }
    });

    socket.on('delete_message_event', ({ messageId, receiverId }) => {
        const receiverSocketId = userSocketMap[receiverId];
        if(receiverSocketId) {
            io.to(receiverSocketId).emit('message_deleted', messageId);
        }
    });

    // Friend requests
    socket.on('send_friend_request', ({ senderId, receiverId }) => {
        const receiverSocketId = userSocketMap[receiverId];
        if (receiverSocketId) {
            io.to(receiverSocketId).emit('friend_request_received', senderId);
        }
    });

    socket.on('accept_friend_request', ({ senderId, receiverId }) => {
        const senderSocketId = userSocketMap[senderId];
        const receiverSocketId = userSocketMap[receiverId];
        if (senderSocketId) io.to(senderSocketId).emit('friend_request_accepted', receiverId);
        if (receiverSocketId) io.to(receiverSocketId).emit('friend_request_accepted', senderId);
    });

    socket.on('reject_friend_request', ({ senderId, receiverId }) => {
        const senderSocketId = userSocketMap[senderId];
        if (senderSocketId) io.to(senderSocketId).emit('friend_request_rejected', receiverId);
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
      
      const userId = Object.keys(userSocketMap).find(key => userSocketMap[key] === socket.id);
      if (userId) {
        delete userSocketMap[userId];
        io.emit('online_users', Object.keys(userSocketMap));
      }
    });
  });
};
