#!/usr/bin/env node

const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

async function simpleTest() {
  const timestamp = Date.now();
  const testUser = {
    username: `test_${timestamp}`,
    password: 'SimplePass123',
    walletAddress: '5HGjWAeFDfFCWPsjFQdVV2Msvz2XtMktvgocEurrepaDXDAH', // Eve's address
    socialIdHash: `test_social_${timestamp}`,
    socialProvider: 'test'
  };

  try {
    console.log('🚀 Simple Authentication Test');
    console.log('Username:', testUser.username);
    console.log('Password:', testUser.password);
    console.log('');

    // Register
    console.log('📝 Step 1: Registration...');
    const registerResponse = await axios.post(`${API_BASE}/auth/contract/register`, testUser);
    console.log('✅ Registration successful!');
    console.log('');

    // Login immediately
    console.log('🔐 Step 2: Login with same credentials...');
    const loginResponse = await axios.post(`${API_BASE}/auth/contract/login`, {
      username: testUser.username,
      password: testUser.password
    });
    console.log('✅ Login successful!');
    console.log('User:', loginResponse.data.data.user.username);
    console.log('');

    console.log('🎉 Test completed successfully!');

  } catch (error) {
    console.log('❌ Test failed:', error.response?.data?.message || error.message);
    console.log('Full error:', JSON.stringify(error.response?.data, null, 2));
  }
}

simpleTest();