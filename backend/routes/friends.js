const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = require('../models/User');
const FriendRequest = require('../models/FriendRequest');

// Get all friends for a user
router.get('/:userId', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.userId)) {
      return res.status(400).json({ message: 'Invalid User ID' });
    }
    const user = await User.findById(req.params.userId).populate('friends', '-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user.friends);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Get pending friend requests for a user
router.get('/requests/:userId', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.userId)) {
      return res.status(400).json({ message: 'Invalid User ID' });
    }
    const requests = await FriendRequest.find({ receiver: req.params.userId, status: 'pending' })
      .populate('sender', '-password');
    res.json(requests);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Send a friend request
router.post('/request', async (req, res) => {
  const { senderId, receiverId } = req.body;
  if (senderId === receiverId) return res.status(400).json({ message: 'Cannot add yourself' });

  try {
    const sender = await User.findById(senderId);
    const receiver = await User.findById(receiverId);
    if (!sender || !receiver) return res.status(404).json({ message: 'User not found' });

    if (sender.friends.includes(receiverId)) {
      return res.status(400).json({ message: 'Already friends' });
    }

    let request = await FriendRequest.findOne({ sender: senderId, receiver: receiverId });
    if (request && request.status === 'pending') {
      return res.status(400).json({ message: 'Request already sent' });
    }

    if (!request) {
      request = new FriendRequest({ sender: senderId, receiver: receiverId });
    } else {
       request.status = 'pending'; // In case it was rejected previously and they try again
    }
    
    await request.save();
    res.status(201).json(request);
  } catch (err) {
    console.error(err);
    // Duplicate key error code inside index could be 11000, catch it
    if (err.code === 11000) {
        return res.status(400).json({ message: 'Request already exists' });
    }
    res.status(500).json({ message: 'Server Error' });
  }
});

// Accept a friend request
router.post('/accept', async (req, res) => {
  const { requestId } = req.body;
  try {
    const request = await FriendRequest.findById(requestId);
    if (!request || request.status !== 'pending') {
      return res.status(400).json({ message: 'Invalid request' });
    }

    request.status = 'accepted';
    await request.save();

    const sender = await User.findById(request.sender);
    const receiver = await User.findById(request.receiver);

    if (!sender.friends.includes(receiver._id)) sender.friends.push(receiver._id);
    if (!receiver.friends.includes(sender._id)) receiver.friends.push(sender._id);

    await sender.save();
    await receiver.save();

    res.json({ message: 'Friend request accepted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Reject a friend request
router.post('/reject', async (req, res) => {
  const { requestId } = req.body;
  try {
    const request = await FriendRequest.findById(requestId);
    if (!request || request.status !== 'pending') {
      return res.status(400).json({ message: 'Invalid request' });
    }

    request.status = 'rejected';
    await request.save();

    res.json({ message: 'Friend request rejected' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Remove a friend
router.post('/remove', async (req, res) => {
    const { userId, friendId } = req.body;
    try {
        const user = await User.findById(userId);
        const friend = await User.findById(friendId);
        
        if (!user || !friend) return res.status(404).json({ message: 'User not found' });
        
        user.friends = user.friends.filter(id => id.toString() !== friendId);
        friend.friends = friend.friends.filter(id => id.toString() !== userId);
        
        await user.save();
        await friend.save();

        // Also delete any existing friend request history between them to clean up
        await FriendRequest.deleteMany({
            $or: [
                { sender: userId, receiver: friendId },
                { sender: friendId, receiver: userId }
            ]
        });

        res.json({ message: 'Friend removed' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
