#!/usr/bin/env node

const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

async function testLogin() {
  try {
    console.log('🔐 Testing contract login with detailed error info...');
    
    const loginData = {
      username: 'Ash09_',
      password: 'Ash105?2'
    };
    
    console.log('Sending request to:', `${API_BASE}/auth/contract/login`);
    console.log('Request data:', loginData);
    
    const response = await axios.post(`${API_BASE}/auth/contract/login`, loginData);
    console.log('✅ Success:', response.data);
    
  } catch (error) {
    console.log('❌ Error details:');
    console.log('Status:', error.response?.status);
    console.log('Status Text:', error.response?.statusText);
    console.log('Response Data:', JSON.stringify(error.response?.data, null, 2));
    console.log('Request Config:', {
      url: error.config?.url,
      method: error.config?.method,
      data: error.config?.data
    });
  }
}

async function testRegisterFirst() {
  try {
    console.log('📝 First, let\'s register a test user...');
    
    const registerData = {
      username: 'Ash09',
      password: 'Ash105?2',
      walletAddress: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
      socialIdHash: 'ash09_social_hash_' + Date.now(),
      socialProvider: 'test'
    };
    
    const response = await axios.post(`${API_BASE}/auth/contract/register`, registerData);
    console.log('✅ Registration successful');
    
    return true;
  } catch (error) {
    if (error.response?.data?.message?.includes('already exists')) {
      console.log('✅ User already exists, proceeding to login test');
      return true;
    }
    console.log('❌ Registration failed:', error.response?.data?.message);
    return false;
  }
}

async function runDebug() {
  console.log('🚀 Starting Login Debug\n');
  
  const registered = await testRegisterFirst();
  if (registered) {
    console.log('\n');
    await testLogin();
  }
}

runDebug().catch(console.error);