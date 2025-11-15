// Test fresh login and immediate SDK client creation
const API_URL = 'http://localhost:5000/api';

async function testFreshLogin() {
  console.log('🧪 Testing Fresh Login and SDK Client Creation...\n');

  try {
    // Step 1: Fresh login
    console.log('1. Performing fresh login...');
    const loginResponse = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'Ash09@authentify.local',
        password: 'Ash105?2'
      })
    });

    console.log('Login response status:', loginResponse.status);
    
    if (!loginResponse.ok) {
      const errorText = await loginResponse.text();
      console.log('❌ Login failed:', errorText);
      return;
    }

    const loginData = await loginResponse.json();
    console.log('✅ Login successful');
    
    if (!loginData.data || !loginData.data.tokens) {
      console.log('❌ No tokens in login response');
      console.log('Response structure:', JSON.stringify(loginData, null, 2));
      return;
    }

    const accessToken = loginData.data.tokens.accessToken;
    console.log('✅ Got access token:', accessToken.substring(0, 20) + '...');

    // Step 2: Immediately try SDK client creation
    console.log('\n2. Creating SDK client with fresh token...');
    const clientResponse = await fetch(`${API_URL}/sdk-client/clients`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        app_name: 'Fresh Login Test App',
        app_url: 'http://localhost:3000',
        redirect_uris: ['http://localhost:3000/auth/callback']
      })
    });

    console.log('SDK Client response status:', clientResponse.status);
    
    if (clientResponse.ok) {
      const clientData = await clientResponse.json();
      console.log('✅ SDK client created successfully!');
      console.log('Client ID:', clientData.data.client_id);
      console.log('Client Secret:', clientData.data.client_secret.substring(0, 10) + '...');
    } else {
      const errorText = await clientResponse.text();
      console.log('❌ SDK client creation failed');
      console.log('Error response:', errorText);
      
      // Check if it's a database table issue
      if (errorText.includes('relation') || errorText.includes('table')) {
        console.log('\n💡 This looks like a database table issue.');
        console.log('   Please run the SQL script in your Supabase dashboard to create the sdk_clients table.');
      }
    }

  } catch (error) {
    console.log('❌ Test failed:', error.message);
  }
}

testFreshLogin().catch(console.error);