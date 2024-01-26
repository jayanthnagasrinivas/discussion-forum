import React, { useState } from 'react';
import axios from 'axios';

const DiscussionForum = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [postText, setPostText] = useState('');
  const [commentText, setCommentText] = useState('');

  const handleRegister = async () => {
    try {
      // Call the backend API to register user
      const response = await axios.post('/api/register', { name, email });
      console.log(response.data);
      // Display message to the user
    } catch (error) {
      console.error('Error during registration:', error.response.data.error);
    }
}
  };

  const handleLogin = async () => {
    try {
      // Call the backend API to log in user
      const response = await axios.post('/api/login', { email, otp });
      console.log(response.data);
      // Display message to the user
    } catch (error) {
      console.error
    }
};