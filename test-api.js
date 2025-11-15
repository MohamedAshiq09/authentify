// Test script to check API endpoints
const API_URL = 'http://localhost:5000/api';

async function testAPI() {
  console.log('🧪 Testing Authentify API endpoints...\n');

  // Test 1: Health check
  try {
    console.log('1. Testing health endpoint...');
    const healthResponse = await fetch(`${API_URL.replace('/api', '')}/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health check:', healthData.message);
  } catch (error) {
    console.log('❌ Health check failed:', error.message);
  }

  // Test 2: SDK health check
  try {
    console.log('\n2. Testing SDK health endpoint...');
    const sdkHealthResponse = await fetch(`${API_URL}/sdk/health`);
    const sdkHealthData = await sdkHealthResponse.json();
    console.log('✅ SDK health check:', sdkHealthData.message);
  } catch (error) {
    console.log('❌ SDK health check failed:', error.message);
  }

  // Test 3: Try to access SDK client endpoint (should fail without auth)
  try {
    console.log('\n3. Testing SDK client endpoint (should require auth)...');
    const clientResponse = await fetch(`${API_URL}/sdk-client/clients`);
    console.log('Response status:', clientResponse.status);
    
    if (clientResponse.status === 401) {
      console.log('✅ SDK client endpoint properly requires authentication');
    } else {
      const data = await clientResponse.json();
      console.log('Response:', data);
    }
  } catch (error) {
    console.log('❌ SDK client endpoint test failed:', error.message);
  }

  // Test 4: Check if SDK client verify endpoint exists
  try {
    console.log('\n4. Testing SDK client verify endpoint...');
    const verifyResponse = await fetch(`${API_URL}/sdk-client/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: 'test',
        client_secret: 'test'
      })
    });
    console.log('Verify endpoint status:', verifyResponse.status);
    
    if (verifyResponse.status === 401 || verifyResponse.status === 400) {
      console.log('✅ SDK client verify endpoint exists and validates credentials');
    }
  } catch (error) {
    console.log('❌ SDK client verify endpoint test failed:', error.message);
  }

  console.log('\n🏁 API test completed!');
}

// Run the test
testAPI().catch(console.error);