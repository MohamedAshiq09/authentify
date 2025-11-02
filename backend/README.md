# Authentify Backend

A comprehensive TypeScript backend for decentralized identity authentication system with OAuth integration, JWT sessions, and smart contract interaction.

## 🚀 Features

- **Authentication System**
  - Email/Password registration and login
  - OAuth integration (Google, GitHub, Twitter)
  - JWT-based session management
  - Password reset functionality

- **Smart Contract Integration**
  - User registration on blockchain
  - Contract state queries
  - Real-time event listening
  - Event caching and indexing

- **SDK Management**
  - Client ID/Secret generation for dApps
  - API usage analytics
  - Rate limiting
  - Redirect URI validation

- **Security**
  - Rate limiting on all endpoints
  - Input validation and sanitization
  - Helmet security headers
  - CORS configuration

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration files
│   ├── types/           # TypeScript type definitions
│   ├── utils/           # Utility functions
│   ├── middleware/      # Express middleware
│   ├── services/        # Business logic
│   ├── controllers/     # Route handlers
│   ├── routes/          # API routes
│   └── server.ts        # Main entry point
├── .env                 # Environment variables
├── package.json         # Dependencies
└── tsconfig.json        # TypeScript config
```

## 🛠️ Setup Instructions

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Environment Configuration

Update your `.env` file with your actual values:

```env
# Supabase Configuration (Required)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_KEY=your_service_key_here

# JWT Secrets (Required - Generate strong secrets)
JWT_SECRET=your_super_secret_jwt_key_minimum_32_characters_long
JWT_REFRESH_SECRET=your_refresh_secret_key_also_32_chars_min

# Smart Contract (Required)
CONTRACT_ADDRESS=0xYourContractAddress
RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
SERVICE_ACCOUNT_PRIVATE_KEY=0xYourPrivateKey

# OAuth (Optional - already configured)
TWITTER_CLIENT_ID=your_twitter_client_id
TWITTER_CLIENT_SECRET=your_twitter_client_secret
```

### 3. Database Setup

Run the SQL schema in your Supabase dashboard:

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT,
  wallet_address TEXT UNIQUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- OAuth Accounts
CREATE TABLE oauth_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  provider_id TEXT NOT NULL,
  email TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(provider, provider_id)
);

-- Sessions
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  session_token TEXT UNIQUE NOT NULL,
  refresh_token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- SDK Clients
CREATE TABLE sdk_clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id TEXT UNIQUE NOT NULL,
  client_secret TEXT NOT NULL,
  app_name TEXT NOT NULL,
  app_url TEXT,
  redirect_uris TEXT[],
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- API Usage Analytics
CREATE TABLE api_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id TEXT REFERENCES sdk_clients(client_id),
  endpoint TEXT NOT NULL,
  method TEXT NOT NULL,
  status_code INTEGER,
  response_time_ms INTEGER,
  timestamp TIMESTAMP DEFAULT NOW()
);

-- Contract Event Cache
CREATE TABLE contract_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_name TEXT NOT NULL,
  block_number BIGINT NOT NULL,
  transaction_hash TEXT NOT NULL,
  user_address TEXT,
  data JSONB,
  indexed_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);
CREATE INDEX idx_oauth_accounts_user_id ON oauth_accounts(user_id);
CREATE INDEX idx_api_usage_client_id ON api_usage(client_id);
CREATE INDEX idx_api_usage_timestamp ON api_usage(timestamp);
CREATE INDEX idx_contract_events_block ON contract_events(block_number);
CREATE INDEX idx_contract_events_user ON contract_events(user_address);
```

### 4. Run the Server

```bash
# Development mode
npm run dev

# Production build
npm run build
npm start
```

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/oauth/callback` - OAuth callback handler
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/wallet` - Update wallet address
- `PUT /api/auth/password` - Change password
- `POST /api/auth/password/request-reset` - Request password reset
- `POST /api/auth/password/reset` - Reset password with token

### Session Management
- `POST /api/session/refresh` - Refresh access token
- `POST /api/session/logout` - Logout (single session)
- `POST /api/session/logout-all` - Logout from all devices
- `GET /api/session/sessions` - Get active sessions
- `GET /api/session/validate` - Validate current session

### Smart Contract
- `POST /api/contract/register` - Register user on contract
- `GET /api/contract/user/:address/can-login` - Check if user can login
- `GET /api/contract/user/:address/auth-methods` - Get user's auth methods
- `GET /api/contract/user/:address/events` - Get user's contract events
- `POST /api/contract/sync` - Sync contract events
- `GET /api/contract/events/recent` - Get recent events
- `GET /api/contract/listener/status` - Get event listener status

### SDK Management
- `POST /api/sdk/clients` - Create SDK client
- `GET /api/sdk/clients` - Get user's SDK clients
- `GET /api/sdk/client/:id` - Get client details
- `PUT /api/sdk/client/:id` - Update SDK client
- `DELETE /api/sdk/client/:id` - Delete SDK client
- `POST /api/sdk/client/:id/regenerate-secret` - Regenerate client secret
- `GET /api/sdk/client/:id/analytics` - Get client analytics
- `POST /api/sdk/verify` - Verify client credentials

## 🔧 Usage Examples

### Register User
```javascript
const response = await fetch('/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'SecurePass123',
    wallet_address: '0x742d35Cc6634C0532925a3b8D4C2C4e0C8b8E5C2'
  })
});
```

### Login User
```javascript
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'SecurePass123'
  })
});
```

### Create SDK Client
```javascript
const response = await fetch('/api/sdk/clients', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`
  },
  body: JSON.stringify({
    app_name: 'My DApp',
    app_url: 'https://mydapp.com',
    redirect_uris: ['https://mydapp.com/callback']
  })
});
```

## 🔒 Security Features

- **Rate Limiting**: Different limits for auth vs general endpoints
- **Input Validation**: All inputs validated and sanitized
- **JWT Security**: Separate access and refresh tokens
- **Password Security**: Bcrypt hashing with salt rounds
- **CORS Protection**: Configured for your frontend domain
- **Helmet Security**: Security headers automatically applied

## 🚀 Deployment

1. Set `NODE_ENV=production` in your environment
2. Configure your production database URLs
3. Set strong JWT secrets
4. Deploy to your preferred platform (Vercel, Railway, etc.)

## 📝 Notes

- The OAuth credentials you provided are already configured
- Update the contract ABI in `contract.config.ts` when your contract is deployed
- The event listener starts automatically in production mode
- Sessions are automatically cleaned up every hour
- All API responses follow a consistent format with success/error status

Your backend is now ready to handle authentication, contract interactions, and SDK management for your Authentify project! 🎉