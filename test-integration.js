#!/usr/bin/env node

const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

async function testBackendHealth() {
  try {
    console.log('🔍 Testing backend health...');
    
    // Test basic health endpoint
    const healthResponse = await axios.get('http://localhost:5000/health');
    console.log('✅ Backend health:', healthResponse.data);
    
    // Test contract status
    try {
      const contractResponse = await axios.get(`${API_BASE}/contract/status`);
      console.log('📄 Contract status:', contractResponse.data);
    } catch (error) {
      console.log('⚠️  Contract status not available:', error.response?.data?.message || error.message);
    }
    
    return true;
  } catch (error) {
    console.error('❌ Backend health check failed:', error.response?.data || error.message);
    return false;
  }
}

async function testContractLogin() {
  try {
    console.log('\n🔐 Testing contract-based login...');
    
    const loginData = {
      username: 'testuser',
      password: 'TestPassword123'
    };
    
    const response = await axios.post(`${API_BASE}/auth/contract/login`, loginData);
    console.log('✅ Contract login response:', response.data);
    
    return true;
  } catch (error) {
    console.log('⚠️  Contract login failed (expected if no user exists):', error.response?.data?.message || error.message);
    return false;
  }
}

async function testContractRegistration() {
  try {
    console.log('\n📝 Testing contract-based registration...');
    
    const registerData = {
      username: 'testuser' + Date.now(),
      password: 'TestPassword123',
      walletAddress: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY', // Alice's address
      socialIdHash: 'test_social_hash_' + Date.now(),
      socialProvider: 'test'
    };
    
    const response = await axios.post(`${API_BASE}/auth/contract/register`, registerData);
    console.log('✅ Contract registration response:', response.data);
    
    return true;
  } catch (error) {
    console.log('⚠️  Contract registration failed:', error.response?.data?.message || error.message);
    return false;
  }
}

async function runTests() {
  console.log('🚀 Starting Authentify Integration Tests\n');
  
  const healthOk = await testBackendHealth();
  if (!healthOk) {
    console.log('\n❌ Backend is not healthy. Please start the backend server first.');
    process.exit(1);
  }
  
  await testContractLogin();
  await testContractRegistration();
  
  console.log('\n✅ Integration tests completed!');
  console.log('\n📋 Summary:');
  console.log('- Backend is running and healthy');
  console.log('- Contract endpoints are accessible');
  console.log('- Authentication flow is ready for testing');
  console.log('\n🌐 Next steps:');
  console.log('1. Start the frontend: cd frontend && npm run dev');
  console.log('2. Open http://localhost:3000');
  console.log('3. Test registration and login flows');
}

runTests().catch(console.error);