#!/usr/bin/env node

const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

async function testNewUser() {
  const timestamp = Date.now();
  const testUser = {
    username: 'NewUser' + timestamp,
    password: 'NewPass123!',
    walletAddress: '5Gv8YYFu8H1btvmrJy9FjjAWfb99wrhV3uhPFoNEr918utyR', // Ferdie's address
    socialIdHash: `new_user_social_${timestamp}`,
    socialProvider: 'test'
  };

  try {
    console.log('🚀 Testing with completely new user');
    console.log('Username:', testUser.username);
    console.log('Password:', testUser.password);
    console.log('Wallet:', testUser.walletAddress);
    console.log('');

    // Step 1: Register
    console.log('📝 Step 1: Registration...');
    const registerResponse = await axios.post(`${API_BASE}/auth/contract/register`, testUser);
    console.log('✅ Registration successful!');
    console.log('User ID:', registerResponse.data.data.user.id);
    console.log('Email:', registerResponse.data.data.user.email);
    console.log('');

    // Step 2: Login immediately with same credentials
    console.log('🔐 Step 2: Login with same credentials...');
    const loginResponse = await axios.post(`${API_BASE}/auth/contract/login`, {
      username: testUser.username,
      password: testUser.password
    });
    console.log('✅ Login successful!');
    console.log('Logged in as:', loginResponse.data.data.user.email);
    console.log('Access token length:', loginResponse.data.data.tokens.accessToken.length);
    console.log('');

    console.log('🎉 Complete authentication flow working!');
    console.log('');
    console.log('Now you can use these credentials in the frontend:');
    console.log('Username:', testUser.username);
    console.log('Password:', testUser.password);

  } catch (error) {
    console.log('❌ Test failed at step:', error.config?.url?.includes('register') ? 'Registration' : 'Login');
    console.log('Error:', error.response?.data?.message || error.message);
    
    if (error.response?.data) {
      console.log('Full error response:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

testNewUser();