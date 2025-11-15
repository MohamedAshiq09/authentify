// Complete flow test for Authentify SDK
const API_URL = 'http://localhost:5000/api';

async function testCompleteFlow() {
  console.log('🧪 Testing Complete Authentify Flow...\n');

  let accessToken = null;
  let userId = null;

  // Step 1: Register a test user
  try {
    console.log('1. Registering test user...');
    const registerResponse = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'developer@test.com',
        password: 'TestPass123!',
        wallet_address: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY'
      })
    });

    if (registerResponse.ok) {
      const registerData = await registerResponse.json();
      accessToken = registerData.data.tokens.access_token;
      userId = registerData.data.user.id;
      console.log('✅ User registered successfully');
      console.log('   User ID:', userId);
    } else if (registerResponse.status === 400) {
      // User might already exist, try to login
      console.log('⚠️  User might already exist, trying to login...');
      
      const loginResponse = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'developer@test.com',
          password: 'TestPass123!'
        })
      });

      if (loginResponse.ok) {
        const loginData = await loginResponse.json();
        accessToken = loginData.data.tokens.access_token;
        userId = loginData.data.user.id;
        console.log('✅ User logged in successfully');
        console.log('   User ID:', userId);
      } else {
        throw new Error('Failed to login existing user');
      }
    } else {
      throw new Error(`Registration failed: ${registerResponse.status}`);
    }
  } catch (error) {
    console.log('❌ User registration/login failed:', error.message);
    return;
  }

  // Step 2: Create SDK Client
  try {
    console.log('\n2. Creating SDK client...');
    const clientResponse = await fetch(`${API_URL}/sdk-client/clients`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        app_name: 'Test Application',
        app_url: 'http://localhost:3000',
        redirect_uris: ['http://localhost:3000/auth/callback']
      })
    });

    if (clientResponse.ok) {
      const clientData = await clientResponse.json();
      console.log('✅ SDK client created successfully');
      console.log('   Client ID:', clientData.data.client_id);
      console.log('   Client Secret:', clientData.data.client_secret.substring(0, 10) + '...');
      
      // Step 3: Verify the client credentials
      console.log('\n3. Verifying client credentials...');
      const verifyResponse = await fetch(`${API_URL}/sdk-client/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: clientData.data.client_id,
          client_secret: clientData.data.client_secret
        })
      });

      if (verifyResponse.ok) {
        const verifyData = await verifyResponse.json();
        console.log('✅ Client credentials verified successfully');
        console.log('   App Name:', verifyData.data.app_name);
      } else {
        console.log('❌ Client verification failed:', verifyResponse.status);
      }

      // Step 4: List SDK clients
      console.log('\n4. Listing SDK clients...');
      const listResponse = await fetch(`${API_URL}/sdk-client/clients`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });

      if (listResponse.ok) {
        const listData = await listResponse.json();
        console.log('✅ SDK clients listed successfully');
        console.log('   Total clients:', listData.data.clients.length);
      } else {
        console.log('❌ Failed to list SDK clients:', listResponse.status);
      }

    } else {
      const errorData = await clientResponse.json();
      console.log('❌ SDK client creation failed:', clientResponse.status);
      console.log('   Error:', errorData.message);
      
      // Check if it's a database error
      if (errorData.message.includes('relation') || errorData.message.includes('table')) {
        console.log('\n💡 This looks like a database table issue.');
        console.log('   Please run the SQL script in your Supabase dashboard to create the sdk_clients table.');
      }
    }
  } catch (error) {
    console.log('❌ SDK client creation failed:', error.message);
  }

  console.log('\n🏁 Complete flow test finished!');
}

// Run the test
testCompleteFlow().catch(console.error);