#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: './backend/.env' });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function checkUser() {
  try {
    console.log('🔍 Checking user in database...');
    
    // Get user by username
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .or('username.eq.testuser,email.eq.testuser@authentify.local')
      .single();
    
    if (error) {
      console.log('❌ User not found:', error.message);
      return;
    }
    
    console.log('✅ User found:');
    console.log('- ID:', user.id);
    console.log('- Email:', user.email);
    console.log('- Username:', user.username);
    console.log('- Wallet Address:', user.wallet_address);
    console.log('- Password Hash:', user.password_hash?.substring(0, 20) + '...');
    console.log('- Created:', user.created_at);
    
    // Test password comparison
    const testPassword = 'TestPassword123';
    console.log('\n🔐 Testing password comparison...');
    console.log('Test password:', testPassword);
    
    if (user.password_hash) {
      const isValid = await bcrypt.compare(testPassword, user.password_hash);
      console.log('Password match:', isValid ? '✅ YES' : '❌ NO');
      
      if (!isValid) {
        console.log('\n🔧 Let\'s check if password was double-hashed...');
        // Try hashing the test password and comparing
        const hashedTest = await bcrypt.hash(testPassword, 10);
        console.log('Hashed test password:', hashedTest.substring(0, 20) + '...');
        
        const doubleHashMatch = await bcrypt.compare(hashedTest, user.password_hash);
        console.log('Double-hash match:', doubleHashMatch ? '✅ YES (PROBLEM!)' : '❌ NO');
      }
    } else {
      console.log('❌ No password hash stored');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkUser().then(() => process.exit(0)).catch(console.error);