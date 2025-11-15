# Authentify SDK - Complete Setup Guide

This guide will walk you through setting up the complete Authentify SDK system from scratch.

## 🎯 Overview

Your Authentify project now includes:

1. **Backend API** - Authentication server with SDK client management
2. **Frontend Dashboard** - User interface for managing SDK clients
3. **SDK Package** - NPM package for developers to integrate
4. **Database** - Supabase with proper tables and security

## 📋 Prerequisites

- Node.js 18+ installed
- Supabase account and project
- Git repository (optional)

## 🚀 Step 1: Database Setup

### 1.1 Create Supabase Tables

Go to your Supabase dashboard → SQL Editor and run this SQL:

```sql
-- Run this SQL in your Supabase SQL Editor

-- Create SDK clients table for developer applications
CREATE TABLE IF NOT EXISTS sdk_clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id VARCHAR(64) UNIQUE NOT NULL,
    client_secret VARCHAR(128) NOT NULL,
    app_name VARCHAR(100) NOT NULL,
    app_url VARCHAR(255),
    redirect_uris TEXT[] NOT NULL,
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index on client_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_sdk_clients_client_id ON sdk_clients(client_id);
CREATE INDEX IF NOT EXISTS idx_sdk_clients_created_by ON sdk_clients(created_by);

-- Create API usage tracking table
CREATE TABLE IF NOT EXISTS api_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id VARCHAR(64) NOT NULL REFERENCES sdk_clients(client_id) ON DELETE CASCADE,
    endpoint VARCHAR(255) NOT NULL,
    method VARCHAR(10) NOT NULL,
    status_code INTEGER NOT NULL,
    response_time_ms INTEGER NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for analytics queries
CREATE INDEX IF NOT EXISTS idx_api_usage_client_id ON api_usage(client_id);
CREATE INDEX IF NOT EXISTS idx_api_usage_timestamp ON api_usage(timestamp);
CREATE INDEX IF NOT EXISTS idx_api_usage_client_timestamp ON api_usage(client_id, timestamp);

-- Add RLS policies (if using Row Level Security)
ALTER TABLE sdk_clients ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own SDK clients" ON sdk_clients;
DROP POLICY IF EXISTS "Users can create SDK clients" ON sdk_clients;
DROP POLICY IF EXISTS "Users can update their own SDK clients" ON sdk_clients;
DROP POLICY IF EXISTS "Users can delete their own SDK clients" ON sdk_clients;

-- Create new policies
CREATE POLICY "Users can view their own SDK clients"
    ON sdk_clients FOR SELECT
    USING (created_by = auth.uid());

CREATE POLICY "Users can create SDK clients"
    ON sdk_clients FOR INSERT
    WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update their own SDK clients"
    ON sdk_clients FOR UPDATE
    USING (created_by = auth.uid());

CREATE POLICY "Users can delete their own SDK clients"
    ON sdk_clients FOR DELETE
    USING (created_by = auth.uid());

-- Test the tables
SELECT 'SDK tables created successfully!' as status;
```

## 🔧 Step 2: Backend Setup

### 2.1 Install Dependencies

```bash
cd backend
npm install
```

### 2.2 Environment Configuration

Update your `backend/.env`:

```env
# Database
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_key

# JWT
JWT_SECRET=your_jwt_secret_min_32_chars
JWT_REFRESH_SECRET=your_refresh_secret_min_32_chars

# Server
PORT=5001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Blockchain (optional)
CONTRACT_ADDRESS=5CG72q4gLqnnu8WW6wYsE4c5Te9E73j4qXNN85WkEY86Vn5R
SUBSTRATE_WS_ENDPOINT=wss://rpc1.paseo.popnetwork.xyz
SERVICE_ACCOUNT_SEED=//Alice
```

### 2.3 Start Backend

```bash
cd backend
npm run dev
```

The backend should start on http://localhost:5001

## 🎨 Step 3: Frontend Setup

### 3.1 Install Dependencies

```bash
cd frontend
npm install
```

### 3.2 Environment Configuration

Update your `frontend/.env`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5001/api
```

### 3.3 Start Frontend

```bash
cd frontend
npm run dev
```

The frontend should start on http://localhost:3000

## 📦 Step 4: SDK Package Setup

### 4.1 Build SDK

```bash
cd sdk
npm install
npm run build
```

### 4.2 Test SDK Locally

```bash
cd sdk
npm link
```

Then in a test project:

```bash
npm link authentify-sdk
```

## 🧪 Step 5: Complete User Flow Test

### 5.1 Register as a Developer

1. Go to http://localhost:3000
2. Click "Register"
3. Create an account with email/password
4. Login to your account

### 5.2 Create SDK Client

1. In the dashboard, go to "API" section
2. Click "Create Client"
3. Fill in:
   - App Name: "My Test App"
   - App URL: "http://localhost:3000"
   - Redirect URIs: ["http://localhost:3000/auth/callback"]
4. Click "Create Client"
5. **IMPORTANT**: Copy and save the Client Secret immediately!

### 5.3 Test SDK Integration

Create a test file `test-sdk.js`:

```javascript
import { AuthentifySDK } from 'authentify-sdk';

const sdk = new AuthentifySDK({
  clientId: 'your_client_id_from_step_5.2',
  apiUrl: 'http://localhost:5001/api',
});

async function test() {
  try {
    // Register a user
    const user = await sdk.register({
      email: 'user@example.com',
      password: 'SecurePass123!',
      username: 'testuser',
    });
    console.log('✅ User registered:', user);

    // Login
    const session = await sdk.login({
      email: 'user@example.com',
      password: 'SecurePass123!',
    });
    console.log('✅ Login successful:', session);

    // Check auth status
    console.log('✅ Is authenticated:', sdk.isAuthenticated());

    // Get current user
    const currentUser = sdk.getCurrentUser();
    console.log('✅ Current user:', currentUser);

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

test();
```

Run the test:

```bash
node test-sdk.js
```

## 🎉 Step 6: Production Deployment

### 6.1 Deploy Backend

**Option A: Railway**

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login and deploy
railway login
cd backend
railway init
railway up
```

**Option B: Vercel**

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd backend
vercel
```

### 6.2 Deploy Frontend

```bash
cd frontend
vercel --prod
```

### 6.3 Publish SDK to NPM

```bash
cd sdk
npm login
npm publish --access public
```

## 📚 Step 7: Documentation

### 7.1 Update SDK Documentation

Update the SDK README with your actual API URLs and examples.

### 7.2 Create Developer Guide

Create documentation for developers who will use your SDK:

1. Getting started guide
2. API reference
3. Code examples
4. Best practices

## 🔒 Security Checklist

- [ ] All environment variables are set correctly
- [ ] Database RLS policies are enabled
- [ ] HTTPS is enabled in production
- [ ] Client secrets are never exposed in frontend code
- [ ] Rate limiting is configured
- [ ] CORS is properly configured

## 🐛 Troubleshooting

### Common Issues

**1. "Client ID not found" error**
- Make sure you've created an SDK client in the dashboard
- Verify the CLIENT_ID is correct in your code

**2. "CORS error"**
- Check that FRONTEND_URL is set correctly in backend/.env
- Verify the API URL in frontend/.env

**3. "Database connection failed"**
- Verify Supabase credentials in backend/.env
- Check that the SDK tables were created successfully

**4. "SDK build fails"**
- Make sure all dependencies are installed: `npm install`
- Check that TypeScript is configured correctly

### Getting Help

- Check the console logs for detailed error messages
- Verify all environment variables are set
- Test each component individually (backend, frontend, SDK)

## 🎯 Next Steps

Once everything is working:

1. **Add more authentication methods** (OAuth, biometric)
2. **Implement analytics** for API usage tracking
3. **Add webhook support** for real-time notifications
4. **Create more SDK examples** for different frameworks
5. **Set up monitoring** and error tracking

## 📞 Support

If you need help:

1. Check the troubleshooting section above
2. Review the console logs for errors
3. Test each component step by step
4. Create an issue in the GitHub repository

---

🎉 **Congratulations!** You now have a complete SDK system running. Developers can register on your platform, get API credentials, and integrate authentication into their apps with just a few lines of code!