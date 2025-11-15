// Debug authentication issues
const API_URL = 'http://localhost:5000/api';

async function debugAuth() {
  console.log('🔍 Debugging Authentication...\n');

  // Test 1: Try to register a new user with unique email
  const uniqueEmail = `test-${Date.now()}@example.com`;
  
  try {
    console.log('1. Registering new user with unique email...');
    console.log('   Email:', uniqueEmail);
    
    const registerResponse = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: uniqueEmail,
        password: 'TestPass123!'
      })
    });

    console.log('   Response status:', registerResponse.status);
    
    if (registerResponse.ok) {
      const registerData = await registerResponse.json();
      console.log('✅ Registration successful');
      console.log('   User ID:', registerData.data.user.id);
      console.log('   Access Token:', registerData.data.tokens?.access_token?.substring(0, 20) + '...' || 'No token received');
      
      // If no token from registration, try logging in
      let accessToken = registerData.data.tokens?.access_token;
      
      if (!accessToken) {
        console.log('\n1.5. No token from registration, trying login...');
        const loginResponse = await fetch(`${API_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: uniqueEmail,
            password: 'TestPass123!'
          })
        });
        
        if (loginResponse.ok) {
          const loginData = await loginResponse.json();
          accessToken = loginData.data.tokens.access_token;
          console.log('✅ Login successful, got token');
        } else {
          console.log('❌ Login failed');
          return;
        }
      }
      
      // Now test SDK client creation
      console.log('\n2. Testing SDK client creation...');
      const clientResponse = await fetch(`${API_URL}/sdk-client/clients`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${registerData.data.tokens.access_token}`
        },
        body: JSON.stringify({
          app_name: 'Debug Test App',
          app_url: 'http://localhost:3000',
          redirect_uris: ['http://localhost:3000/auth/callback']
        })
      });

      console.log('   SDK Client Response status:', clientResponse.status);
      
      if (clientResponse.ok) {
        const clientData = await clientResponse.json();
        console.log('✅ SDK client created successfully');
        console.log('   Client ID:', clientData.data.client_id);
      } else {
        const errorData = await clientResponse.json();
        console.log('❌ SDK client creation failed');
        console.log('   Error:', errorData);
      }
      
    } else {
      const errorData = await registerResponse.json();
      console.log('❌ Registration failed');
      console.log('   Error:', errorData);
    }
    
  } catch (error) {
    console.log('❌ Request failed:', error.message);
  }
}

debugAuth().catch(console.error);