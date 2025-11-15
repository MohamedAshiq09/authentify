// Test register new user and immediately create SDK client
const API_URL = 'http://localhost:5000/api';

async function testRegisterAndSDK() {
  console.log('🧪 Testing Register + SDK Client Creation...\n');

  const uniqueEmail = `test-${Date.now()}@authentify.local`;
  const password = 'TestPass123!';

  try {
    // Step 1: Register new user
    console.log('1. Registering new user...');
    console.log('   Email:', uniqueEmail);
    
    const registerResponse = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: uniqueEmail,
        password: password
      })
    });

    console.log('Register response status:', registerResponse.status);
    
    if (!registerResponse.ok) {
      const errorText = await registerResponse.text();
      console.log('❌ Registration failed:', errorText);
      return;
    }

    const registerData = await registerResponse.json();
    console.log('✅ Registration successful');
    console.log('User ID:', registerData.data.user.id);

    // Step 2: Login with the new user
    console.log('\n2. Logging in with new user...');
    const loginResponse = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: uniqueEmail,
        password: password
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

    // Step 3: Create SDK client
    console.log('\n3. Creating SDK client...');
    const clientResponse = await fetch(`${API_URL}/sdk-client/clients`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        app_name: 'Test App from Register Flow',
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
      
      console.log('\n🎉 Complete flow working! The issue is likely with your existing user credentials.');
      console.log('💡 Try logging out and logging back in on your frontend to get a fresh token.');
      
    } else {
      const errorText = await clientResponse.text();
      console.log('❌ SDK client creation failed');
      console.log('Error response:', errorText);
      
      if (errorText.includes('relation') || errorText.includes('table') || errorText.includes('sdk_clients')) {
        console.log('\n💡 DATABASE TABLE MISSING!');
        console.log('   You MUST create the sdk_clients table in Supabase first.');
        console.log('   Go to Supabase → SQL Editor and run the SQL script.');
      }
    }

  } catch (error) {
    console.log('❌ Test failed:', error.message);
  }
}

testRegisterAndSDK().catch(console.error);