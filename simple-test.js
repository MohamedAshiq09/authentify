// Simple test to debug the exact issue
const API_URL = 'http://localhost:5000/api';

async function simpleTest() {
  console.log('🔍 Simple Authentication Test...\n');

  // Test login with a known user (if exists)
  try {
    console.log('1. Testing login...');
    const loginResponse = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'Ash09@authentify.local',
        password: 'Ash105?2'
      })
    });

    console.log('Login response status:', loginResponse.status);
    
    if (loginResponse.ok) {
      const loginData = await loginResponse.json();
      console.log('✅ Login successful');
      console.log('Response structure:', Object.keys(loginData));
      console.log('Data structure:', Object.keys(loginData.data || {}));
      
      if (loginData.data && loginData.data.tokens) {
        const accessToken = loginData.data.tokens.access_token;
        console.log('✅ Got access token');
        
        // Test SDK client creation
        console.log('\n2. Testing SDK client creation...');
        const clientResponse = await fetch(`${API_URL}/sdk-client/clients`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          },
          body: JSON.stringify({
            app_name: 'Simple Test App',
            app_url: 'http://localhost:3000',
            redirect_uris: ['http://localhost:3000/auth/callback']
          })
        });

        console.log('SDK Client response status:', clientResponse.status);
        
        if (clientResponse.ok) {
          const clientData = await clientResponse.json();
          console.log('✅ SDK client created successfully!');
          console.log('Client ID:', clientData.data.client_id);
        } else {
          const errorText = await clientResponse.text();
          console.log('❌ SDK client creation failed');
          console.log('Error response:', errorText);
        }
      }
    } else {
      const errorText = await loginResponse.text();
      console.log('❌ Login failed');
      console.log('Error response:', errorText);
    }
    
  } catch (error) {
    console.log('❌ Request failed:', error.message);
  }
}

simpleTest().catch(console.error);