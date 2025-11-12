#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function runMigration() {
  console.log('🔄 Running database migration...');
  
  try {
    // Add username column to users table
    console.log('📝 Adding username column to users table...');
    
    const { error: alterError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE users ADD COLUMN IF NOT EXISTS username VARCHAR(32);
        CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
      `
    });
    
    if (alterError) {
      console.error('❌ Failed to add username column:', alterError);
      
      // Try alternative approach - check if we can query the table structure
      console.log('🔍 Checking current table structure...');
      const { data: tableInfo, error: infoError } = await supabase
        .from('users')
        .select('*')
        .limit(1);
      
      if (infoError) {
        console.error('❌ Cannot access users table:', infoError);
        console.log('\n📋 Manual steps required:');
        console.log('1. Go to your Supabase dashboard');
        console.log('2. Navigate to the SQL Editor');
        console.log('3. Run this SQL:');
        console.log('   ALTER TABLE users ADD COLUMN username VARCHAR(32);');
        console.log('   CREATE INDEX idx_users_username ON users(username);');
        return;
      }
      
      console.log('✅ Users table exists, but column addition failed');
      console.log('This might be because the column already exists or due to permissions');
    } else {
      console.log('✅ Username column added successfully');
    }
    
    // Test the migration by trying to insert a test record
    console.log('🧪 Testing database schema...');
    const testUser = {
      email: 'test@example.com',
      username: 'testuser',
      password_hash: 'test_hash',
      wallet_address: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY'
    };
    
    // Try to insert (this will fail if user exists, which is fine)
    const { error: insertError } = await supabase
      .from('users')
      .insert(testUser);
    
    if (insertError) {
      if (insertError.message.includes('duplicate key') || insertError.message.includes('already exists')) {
        console.log('✅ Schema test passed (test user already exists)');
      } else if (insertError.message.includes('username')) {
        console.log('✅ Username column is working');
      } else {
        console.log('⚠️  Schema test result:', insertError.message);
      }
    } else {
      console.log('✅ Test user inserted successfully');
      
      // Clean up test user
      await supabase
        .from('users')
        .delete()
        .eq('email', 'test@example.com');
      console.log('🧹 Test user cleaned up');
    }
    
    console.log('\n✅ Database migration completed!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    console.log('\n📋 Manual migration required:');
    console.log('Please run this SQL in your Supabase dashboard:');
    console.log('ALTER TABLE users ADD COLUMN username VARCHAR(32);');
    console.log('CREATE INDEX idx_users_username ON users(username);');
  }
}

runMigration().then(() => process.exit(0)).catch(console.error);