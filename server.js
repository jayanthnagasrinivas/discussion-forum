const express = require('express');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect('mongodb://localhost/discussionforum', { useNewUrlParser: true, useUnifiedTopology: true });

// Define MongoDB models (User, Post, Comment)

const User = mongoose.model('User', {
  name: String,
  email: String,
  otp: String,
});

const Post = mongoose.model('Post', {
  text: String,
  userId: mongoose.Schema.Types.ObjectId,
  comments: [{ userId: mongoose.Schema.Types.ObjectId, text: String, replies: [{ userId: mongoose.Schema.Types.ObjectId, text: String }] }],
});

// Configure Nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'your-email@gmail.com',
    pass: 'your-password',
  },
});

// Generate OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// REST API endpoints for user authentication, post creation, commenting, etc.

// User registration and OTP generation
app.post('/api/register', async (req, res) => {
  const { name, email } = req.body;

  // Check if the user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ error: 'User already exists' });
  }

  // Generate OTP
  const otp = generateOTP();

  // Save user with OTP to database
  const newUser = new User({ name, email, otp });
  await newUser.save();

  // Send OTP to user via email (you should implement this)
  const mailOptions = {
    from: 'your-email@gmail.com',
    to: email,
    subject: 'OTP Verification',
    text: `Your OTP for registration is: ${otp}`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return res.status(500).json({ error: 'Failed to send OTP' });
    }
    res.json({ message: 'OTP sent successfully' });
  });
});

// User login with OTP verification
app.post('/api/login', async (req, res) => {
  const { email, otp } = req.body;

  // Check if the user with the given email and OTP exists
  const user = await User.findOne({ email, otp });

  if (!user) {
    return res.status(401).json({ error: 'Invalid OTP' });
  }

  // TODO: Implement JWT token creation and return it in response for future authenticated requests
  res.json({ message: 'Login successful' });
});

// Post creation
app.post('/api/posts', async (req, res) => {
  const { text, userId } = req.body;

  // Save post to the database
  const newPost = new Post({ text, userId });
  await newPost.save();

  // Send email to the user
  const user = await User.findById(userId);
  const mailOptions = {
    from: 'your-email@gmail.com',
    to: user.email,
    subject: 'Post Created',
    text: 'Congrats, your post is live now.',
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Failed to send email:', error);
    }
  });

  res.json({ message: 'Post created successfully' });
});

// Comment on a post
app.post('/api/comments', async (req, res) => {
  const { text, userId, postId } = req.body;

  // Save comment to the database
  const post = await Post.findById(postId);
  post.comments.push({ userId, text });
  await post.save();

  // Send email to the post creator
  const postCreator = await User.findById(post.userId);
  const mailOptions = {
    from: 'your-email@gmail.com',
    to: postCreator.email,
    subject: 'New Comment',
    text: `${user.name} commented on your post.`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Failed to send email:', error);
    }
  });

  res.json({ message: 'Comment added successfully' });
});

// Reply to a comment
app.post('/api/replies', async (req, res) => {
  const { text, userId, postId, commentId } = req.body;

  // Save reply to the database
  const post = await Post.findById(postId);
  const comment = post.comments.id(commentId);
  comment.replies.push({ userId, text });
  await post.save();

  // Send email to the original commenter
  const originalCommenter = await User.findById(comment.userId);
  const mailOptions = {
    from: 'your-email@gmail.com',
    to: originalCommenter.email,
    subject: 'New Reply',
    text: `${user.name} replied to your comment.`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Failed to send email:', error);
    }
  });

  res.json({ message: 'Reply added successfully' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
