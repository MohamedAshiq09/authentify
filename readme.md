# Authentify

> **Web3 Authentication Reimagined**: Connect once, login seamlessly, sign when needed.

Authentify is a hybrid Web3 authentication platform built on Polkadot that eliminates repetitive wallet connections. Users connect their wallet once during registration, then use traditional username/password login for future sessions. Wallets only appear when signing blockchain transactions, providing a Web2-like experience without compromising Web3 security.

[![Built on Polkadot](https://img.shields.io/badge/Built%20on-Polkadot-E6007A)](https://polkadot.network/)
[![ink! Smart Contract](https://img.shields.io/badge/Contract-ink!-000000)](https://use.ink/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 🎯 The Problem

Current Web3 authentication creates massive friction:
- Users must connect wallets **5-10 times daily** for every dApp session
- This repetitive process causes a **73% abandonment rate**
- Constant wallet popups interrupt browsing, even without transactions
- This is the **#1 barrier** preventing mainstream Web3 adoption

## ✨ The Solution

Authentify separates **authentication** from **transaction authorization**:

1. **One-Time Connection**: Connect wallet once during registration, link to social accounts
2. **Web2-Style Login**: Use username/password for all future sessions
3. **Smart Signing**: Wallet appears only when signing blockchain transactions
4. **Developer-Friendly**: Production-ready SDK with 5-minute integration

---

## 🏗️ Architecture

Authentify uses a three-layer architecture:
```
┌─────────────────────────────────────────────────────────────┐
│                     LAYER 3: SDK/Frontend                   │
│  Next.js Frontend + NPM SDK (React Hooks, TypeScript)      │
└─────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────┐
│                     LAYER 2: Backend API                     │
│  Node.js + Express + OAuth + JWT + Supabase                 │
└─────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────┐
│                  LAYER 1: Smart Contract                     │
│  ink! Contract on Pop Network (Polkadot Paseo Testnet)     │
└─────────────────────────────────────────────────────────────┘
```

---

## 📦 Project Structure
```
authentify/
├── contract/          # ink! Smart Contract
├── backend/          # Node.js Backend API
├── frontend/         # Next.js Frontend Application
└── sdk/             # NPM SDK Package (optional)
```

---

## 🔧 Component Responsibilities

### **Layer 1: Smart Contract (ink! on Polkadot)**

**Location**: `contract/`

**Responsibilities**:
- Store user identity mappings (wallet address → username)
- Securely store password hashes on-chain
- Verify user credentials during authentication
- Maintain session state and user data

**Key Functions**:
- `register_user(wallet_address, username, password_hash)` - Register new user
- `verify_password(username, password_hash)` - Authenticate user
- `get_user(wallet_address)` - Retrieve user data
- `update_user(username, new_data)` - Update user information

**Deployment**: Pop Network Paseo Testnet

---

### **Layer 2: Backend API (Node.js + Express)**

**Location**: `backend/`

**Responsibilities**:
- Handle OAuth authentication (Google, GitHub, Twitter)
- Generate and validate JWT tokens for session management
- Connect to Polkadot blockchain via `@polkadot/api`
- Manage developer credentials (OAuth-style client ID/secret)
- Store off-chain session data in Supabase
- Provide REST API endpoints for frontend

**Key Endpoints**:
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login with username/password
- `POST /api/auth/oauth/:provider` - OAuth authentication
- `GET /api/auth/me` - Get current user (JWT protected)
- `POST /api/auth/refresh` - Refresh JWT token
- `POST /api/auth/logout` - Logout user

**Technologies**:
- Express.js for REST API
- Supabase for database
- @polkadot/api for blockchain interaction
- JWT for session tokens
- Passport.js for OAuth

---

### **Layer 3: Frontend (Next.js + SDK)**

**Location**: `frontend/`

**Responsibilities**:
- Provide user interface for registration and login
- Handle wallet connection (MetaMask, Polkadot.js)
- Manage user sessions with JWT tokens
- Display transaction signing interface when needed
- Offer seamless Web2-like browsing experience

**Key Features**:
- Modern dark theme UI with glassmorphism effects
- Responsive design
- Wallet integration (MetaMask, Polkadot.js)
- OAuth social login buttons
- Transaction signing modal (appears only when needed)

**Technologies**:
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- @polkadot/extension-dapp for wallet connection

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- Rust and cargo (for contract development)
- cargo-contract CLI tool
- Polkadot.js browser extension (for testing)

### Installation

#### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/authentify.git
cd authentify
```

---

## 📝 Smart Contract Setup

### Installation
```bash
cd contract

# Install dependencies (if any)
cargo build

# Compile the contract
cargo contract build
```

### Configuration

Create `.env` file in `contract/` directory:
```env
# Contract Configuration
CONTRACT_ADDRESS=
NODE_URL=ws://127.0.0.1:9944
ADMIN_SEED=//Alice

# Deployment Settings
MAX_FAILED_ATTEMPTS=5
LOCKOUT_DURATION_MS=900000
```

### Deployment

**Option 1: Deploy to Local Node**
```bash
# Start local substrate node (in separate terminal)
substrate-contracts-node --dev

# Deploy contract
cargo contract instantiate --constructor new \
  --args "Alice" \
  --suri //Alice \
  --skip-confirm
```

**Option 2: Deploy to Pop Network Paseo Testnet**
```bash
# Deploy to testnet
cargo contract instantiate --constructor new \
  --args "Alice" \
  --url wss://rpc1.paseo.popnetwork.xyz \
  --suri "your-seed-phrase" \
  --skip-confirm
```

**Note**: Save the deployed `CONTRACT_ADDRESS` for backend configuration.

### Testing
```bash
# Run contract tests
cargo test
```

---

## 🔌 Backend Setup

### Installation
```bash
cd backend

# Install dependencies
npm install
```

### Configuration

Create `.env` file in `backend/` directory:
```env
# Server Configuration
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:3000

# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_key

# JWT Configuration
JWT_SECRET=your_jwt_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here
JWT_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
TWITTER_CLIENT_ID=your_twitter_client_id
TWITTER_CLIENT_SECRET=your_twitter_client_secret

# Polkadot Contract Configuration - Pop Network Paseo Testnet
CONTRACT_ADDRESS=5ELirgt7r8BS2pMVHiBhgp59T5RMump25yzVorQucifPkNxF
SUBSTRATE_WS_ENDPOINT=wss://rpc1.paseo.popnetwork.xyz
SERVICE_ACCOUNT_SEED=//Alice

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Setup Supabase Database

1. Create a Supabase account at https://supabase.com
2. Create a new project
3. Run the following SQL in Supabase SQL Editor:
```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username TEXT UNIQUE NOT NULL,
  wallet_address TEXT UNIQUE NOT NULL,
  email TEXT,
  oauth_provider TEXT,
  oauth_id TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Sessions table
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  refresh_token TEXT NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Developer credentials table (for SDK users)
CREATE TABLE developer_credentials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id TEXT UNIQUE NOT NULL,
  client_secret TEXT NOT NULL,
  app_name TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Copy Contract Metadata
```bash
# Copy contract metadata from contract build
cp ../contract/target/ink/authentify.json ./contract-metadata.json
```

### Running the Backend
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

Backend will start on `http://localhost:5000`

### API Documentation

Once running, access API documentation at:
- Swagger UI: `http://localhost:5000/api-docs`

---

## 🎨 Frontend Setup

### Installation
```bash
cd frontend

# Install dependencies
npm install
```

### Configuration

Create `.env.local` file in `frontend/` directory:
```env
# Authentify Frontend Environment Variables

# Backend API Configuration
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000

# Polkadot Configuration
NEXT_PUBLIC_WS_PROVIDER=wss://rpc1.paseo.popnetwork.xyz
NEXT_PUBLIC_CONTRACT_ADDRESS=5ELirgt7r8BS2pMVHiBhgp59T5RMump25yzVorQucifPkNxF

# App Configuration
NEXT_PUBLIC_APP_NAME=Authentify
NEXT_PUBLIC_APP_VERSION=1.0.0

# OAuth Configuration
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
NEXT_PUBLIC_GITHUB_CLIENT_ID=your_github_client_id

# Development Configuration
NEXT_PUBLIC_DEBUG=true
```

### Copy Contract Metadata
```bash
# Copy contract metadata from contract build
cp ../contract/target/ink/authentify.json ./public/contract-metadata.json
```

### Running the Frontend
```bash
# Development mode
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Frontend will start on `http://localhost:3000`

---

## 🔗 How Components Connect

### Registration Flow
```
1. User (Frontend) → Clicks "Sign Up"
                   ↓
2. Frontend → Requests wallet connection (MetaMask/Polkadot.js)
                   ↓
3. User → Approves wallet connection
                   ↓
4. Frontend → Sends wallet address + username + password to Backend
                   ↓
5. Backend → Hashes password → Calls smart contract register_user()
                   ↓
6. Smart Contract → Stores wallet address + password hash on-chain
                   ↓
7. Backend → Creates user in Supabase → Generates JWT token
                   ↓
8. Frontend → Receives JWT → User is logged in
```

### Login Flow
```
1. User (Frontend) → Enters username + password
                   ↓
2. Frontend → Sends credentials to Backend
                   ↓
3. Backend → Hashes password → Calls smart contract verify_password()
                   ↓
4. Smart Contract → Verifies credentials on-chain → Returns success/failure
                   ↓
5. Backend → Generates JWT token → Returns to Frontend
                   ↓
6. Frontend → Stores JWT → User is logged in
```

### Transaction Signing Flow
```
1. User (Frontend) → Clicks "Mint NFT" or "Swap Token"
                   ↓
2. Frontend → Checks JWT validity with Backend
                   ↓
3. Backend → Validates JWT → Returns success
                   ↓
4. Frontend → Shows wallet popup (MetaMask/Polkadot.js)
                   ↓
5. User → Signs transaction with wallet
                   ↓
6. Smart Contract → Executes transaction on blockchain
                   ↓
7. Frontend → Transaction complete → Wallet disappears
```

---

## 📦 Using the Authentify SDK

### Installation
```bash
npm install @authentify/sdk
```

### Basic Usage
```typescript
import { AuthProvider, useAuth } from '@authentify/sdk';

// Wrap your app with AuthProvider
function App() {
  return (
    <AuthProvider
      clientId="your_client_id"
      clientSecret="your_client_secret"
      apiUrl="https://api.authentify.io"
    >
      <YourApp />
    </AuthProvider>
  );
}

// Use authentication in your components
function YourComponent() {
  const { user, login, logout, isAuthenticated } = useAuth();

  const handleLogin = async () => {
    await login('username', 'password');
  };

  return (
    <div>
      {isAuthenticated ? (
        <>
          <p>Welcome, {user.username}!</p>
          <button onClick={logout}>Logout</button>
        </>
      ) : (
        <button onClick={handleLogin}>Login</button>
      )}
    </div>
  );
}
```

### Advanced Usage
```typescript
import { useWallet, useTransaction } from '@authentify/sdk';

function TransactionComponent() {
  const { signTransaction } = useTransaction();
  const { walletAddress } = useWallet();

  const handleMintNFT = async () => {
    // Wallet will automatically appear for signing
    const result = await signTransaction({
      type: 'mint',
      data: { nftId: 123 }
    });
    
    console.log('Transaction hash:', result.hash);
  };

  return (
    <div>
      <p>Connected: {walletAddress}</p>
      <button onClick={handleMintNFT}>Mint NFT</button>
    </div>
  );
}
```

---

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test
```

### Frontend Tests
```bash
cd frontend
npm test
```

### Contract Tests
```bash
cd contract
cargo test
```

---

## 🌐 Deployment

### Deploy Smart Contract to Mainnet
```bash
cd contract
cargo contract instantiate --constructor new \
  --args "Admin" \
  --url wss://rpc.polkadot.io \
  --suri "your-mainnet-seed-phrase" \
  --skip-confirm
```

### Deploy Backend

**Using Vercel/Railway/Heroku:**

1. Set environment variables in platform dashboard
2. Deploy from GitHub repository
3. Update `FRONTEND_URL` to production URL

### Deploy Frontend

**Using Vercel:**
```bash
cd frontend
vercel --prod
```

**Using Netlify:**
```bash
cd frontend
netlify deploy --prod
```

---

## 🔐 Security Considerations

- Never commit `.env` files to version control
- Use strong JWT secrets (minimum 32 characters)
- Rotate OAuth client secrets regularly
- Enable rate limiting in production
- Use HTTPS in production
- Validate all user inputs on backend
- Store password hashes on-chain, never plain passwords
- Implement proper CORS configuration

---

## 📊 Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Smart Contract** | ink! (Rust) | On-chain identity verification |
| **Blockchain** | Polkadot (Pop Network) | Decentralized infrastructure |
| **Backend** | Node.js + Express | API and business logic |
| **Database** | Supabase (PostgreSQL) | Off-chain session storage |
| **Frontend** | Next.js 14 + TypeScript | User interface |
| **Styling** | Tailwind CSS | UI design |
| **Authentication** | JWT + OAuth 2.0 | Session management |
| **Wallet** | Polkadot.js + MetaMask | Blockchain interaction |

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Built for Polkadot Hackathon 2024
- Powered by Pop Network Paseo Testnet
- Thanks to the Polkadot and ink! communities

---

## 📞 Contact & Support

- **Documentation**: [docs.authentify.io](https://docs.authentify.io)
- **Discord**: [Join our community](https://discord.gg/authentify)
- **Twitter**: [@authentify](https://twitter.com/authentify)
- **Email**: support@authentify.io

---

## 🎯 Roadmap

- [x] Core authentication system
- [x] Smart contract deployment
- [x] OAuth integration
- [x] Production-ready SDK
- [ ] Biometric authentication
- [ ] Cross-chain identity management
- [ ] Mainnet deployment
- [ ] Developer portal and dashboard
- [ ] Enterprise partnership program

---

**Made with ❤️ by the Authentify Team**

*Bridging Web2 simplicity with Web3 security*