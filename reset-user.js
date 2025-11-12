#!/usr/bin/env node

const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

async function resetAndTestUser() {
  try {
    console.log('🔄 Testing with fresh user registration...');
    
    // Try to register a new user with unique details
    const timestamp = Date.now();
    const registerData = {
      username: `Ash09_${timestamp}`,
      password: 'Ash105?2',
      walletAddress: '5FLSigC9HGRKVhB9FiEo4Y3koPsNmBmLJbpXg2mp1hXcS59Y', // Charlie's address
      socialIdHash: `ash09_social_${timestamp}`,
      socialProvider: 'test'
    };
    
    console.log('📝 Registering new user:', registerData.username);
    const registerResponse = await axios.post(`${API_BASE}/auth/contract/register`, registerData);
    console.log('✅ Registration successful!');
    console.log('User ID:', registerResponse.data.data.user.id);
    
    // Now try to login with the same credentials
    console.log('\n🔐 Testing login with same credentials...');
    const loginData = {
      username: registerData.username,
      password: registerData.password
    };
    
    const loginResponse = await axios.post(`${API_BASE}/auth/contract/login`, loginData);
    console.log('✅ Login successful!');
    console.log('Access Token:', loginResponse.data.data.tokens.accessToken.substring(0, 50) + '...');
    
    return true;
    
  } catch (error) {
    console.log('❌ Error:', error.response?.data?.message || error.message);
    return false;
  }
}

async function testExistingUser() {
  try {
    console.log('🔐 Testing login with existing user Ash09...');
    
    const loginData = {
      username: 'Ash09',
      password: 'Ash105?2'
    };
    
    const loginResponse = await axios.post(`${API_BASE}/auth/contract/login`, loginData);
    console.log('✅ Login successful with existing user!');
    console.log('Access Token:', loginResponse.data.data.tokens.accessToken.substring(0, 50) + '...');
    
    return true;
    
  } catch (error) {
    console.log('❌ Existing user login failed:', error.response?.data?.message || error.message);
    return false;
  }
}

async function runTest() {
  console.log('🚀 Starting User Authentication Test\n');
  
  // First try existing user
  const existingUserWorks = await testExistingUser();
  
  if (!existingUserWorks) {
    console.log('\n🔄 Existing user failed, trying with fresh registration...\n');
    await resetAndTestUser();
  }
}

runTest().catch(console.error);