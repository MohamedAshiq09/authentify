#!/usr/bin/env node

const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

async function testAsh09() {
  try {
    console.log('🔐 Testing login with Ash09 credentials...');
    
    const loginData = {
      username: 'Ash09',
      password: 'Ash105?2'
    };
    
    console.log('Sending login request...');
    const response = await axios.post(`${API_BASE}/auth/contract/login`, loginData);
    
    console.log('✅ Login successful!');
    console.log('User:', response.data.data.user.username);
    console.log('Access Token:', response.data.data.tokens.accessToken.substring(0, 50) + '...');
    
    return true;
    
  } catch (error) {
    console.log('❌ Login failed:', error.response?.data?.message || error.message);
    
    if (error.response?.status === 400) {
      console.log('\n🔧 Let\'s try to register this user first...');
      
      try {
        const registerData = {
          username: 'Ash09',
          password: 'Ash105?2',
          walletAddress: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
          socialIdHash: 'ash09_social_' + Date.now(),
          socialProvider: 'manual'
        };
        
        const registerResponse = await axios.post(`${API_BASE}/auth/contract/register`, registerData);
        console.log('✅ Registration successful!');
        
        // Now try login again
        console.log('🔐 Trying login again...');
        const loginResponse = await axios.post(`${API_BASE}/auth/contract/login`, {
          username: 'Ash09',
          password: 'Ash105?2'
        });
        
        console.log('✅ Login successful after registration!');
        console.log('User:', loginResponse.data.data.user.username);
        
      } catch (regError) {
        console.log('❌ Registration also failed:', regError.response?.data?.message || regError.message);
      }
    }
    
    return false;
  }
}

testAsh09();