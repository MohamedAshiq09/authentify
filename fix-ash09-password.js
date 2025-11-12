#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: './backend/.env' });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function fixAsh09Password() {
  try {
    console.log('🔧 Fixing Ash09 password...');
    
    const newPassword = 'Ash105?2';
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    console.log('New password:', newPassword);
    console.log('Hashed password starts with:', hashedPassword.substring(0, 10));
    
    // Update the user's password
    const { data, error } = await supabase
      .from('users')
      .update({ password_hash: hashedPassword })
      .eq('wallet_address', '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY')
      .select();
    
    if (error) {
      console.log('❌ Failed to update password:', error.message);
      return;
    }
    
    console.log('✅ Password updated successfully!');
    console.log('Updated user:', data[0]?.email);
    
    // Test the password
    console.log('\n🧪 Testing password comparison...');
    const isValid = await bcrypt.compare(newPassword, hashedPassword);
    console.log('Password comparison result:', isValid ? '✅ VALID' : '❌ INVALID');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

fixAsh09Password().then(() => process.exit(0)).catch(console.error);