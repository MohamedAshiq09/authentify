// Example usage of Authentify SDK
import { AuthentifySDK } from '../dist/index.esm.js';

// Initialize SDK
const sdk = new AuthentifySDK({
  clientId: 'your_client_id_here',
  apiUrl: 'http://localhost:5001/api',
});

// Example usage
async function example() {
  try {
    console.log('🚀 Authentify SDK Example');
    
    // Check if already authenticated
    if (sdk.isAuthenticated()) {
      const user = sdk.getCurrentUser();
      console.log('✅ Already logged in as:', user?.email);
      return;
    }
    
    console.log('📝 Registering new user...');
    
    // Register a new user
    const user = await sdk.register({
      email: 'test@example.com',
      password: 'SecurePass123!',
      username: 'testuser',
    });
    
    console.log('✅ User registered:', user);
    
    // Login
    console.log('🔐 Logging in...');
    const session = await sdk.login({
      email: 'test@example.com',
      password: 'SecurePass123!',
    });
    
    console.log('✅ Logged in successfully:', session);
    
    // Get current user
    const currentUser = sdk.getCurrentUser();
    console.log('👤 Current user:', currentUser);
    
    // Check authentication status
    console.log('🔍 Is authenticated:', sdk.isAuthenticated());
    
    // Logout
    console.log('👋 Logging out...');
    await sdk.logout();
    
    console.log('✅ Logged out successfully');
    console.log('🔍 Is authenticated:', sdk.isAuthenticated());
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run example if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  example();
}

export { example };