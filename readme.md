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
└── frontend/         # Next.js Frontend Application
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
- **Cross-Chain Identity Management**: Link user identities across multiple blockchain networks (Polkadot, Ethereum, Solana, etc.)
- **Biometric Authentication Support**: Store encrypted biometric credential hashes for fingerprint and facial recognition authentication

**Key Functions**:
- `register_user(wallet_address, username, password_hash)` - Register new user
- `verify_password(username, password_hash)` - Authenticate user
- `get_user(wallet_address)` - Retrieve user data
- `update_user(username, new_data)` - Update user information
- `link_chain_identity(username, chain_id, wallet_address)` - Link identity across chains
- `verify_chain_identity(username, chain_id)` - Verify cross-chain identity
- `register_biometric(username, biometric_hash, biometric_type)` - Register biometric credential
- `verify_biometric(username, biometric_hash)` - Authenticate using biometric data

**Cross-Chain Identity Features**:
- Support for multiple blockchain networks (Polkadot, Ethereum, Solana, BSC, Polygon)
- Single identity mapped to multiple wallet addresses across different chains
- Unified authentication experience regardless of the chain being used
- Seamless cross-chain dApp access with one login

**Biometric Authentication Features**:
- Fingerprint recognition support (stored as encrypted hashes)
- Facial recognition support (future implementation)
- Secure biometric template storage on-chain
- Multi-factor authentication combining biometric + password
- Privacy-preserving biometric verification (hashes only, never raw data)

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
```bash
git clone https://github.com/yourusername/authentify.git
cd authentify
```

---

## 📝 Smart Contract Setup

### Installation
```bash
cd contract
cargo build
cargo contract build
```

### Configuration

Create `.env` file in `contract/` directory:
```env
CONTRACT_ADDRESS=
NODE_URL=ws://127.0.0.1:9944
ADMIN_SEED=//Alice
MAX_FAILED_ATTEMPTS=5
LOCKOUT_DURATION_MS=900000
```

### Deployment to Pop Network Paseo Testnet
```bash
cargo contract instantiate --constructor new \
  --args "Alice" \
  --url wss://rpc1.paseo.popnetwork.xyz \
  --suri "your-seed-phrase" \
  --skip-confirm
```

**Note**: Save the deployed `CONTRACT_ADDRESS` for backend configuration.

---

## 🔌 Backend Setup

### Installation
```bash
cd backend
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

# Polkadot Contract Configuration
CONTRACT_ADDRESS=your_deployed_contract_address
SUBSTRATE_WS_ENDPOINT=wss://rpc1.paseo.popnetwork.xyz
SERVICE_ACCOUNT_SEED=//Alice

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Copy Contract Metadata
```bash
cp ../contract/target/ink/authentify.json ./contract-metadata.json
```

### Running the Backend
```bash
npm run dev
```

Backend will start on `http://localhost:5000`

---

## 🎨 Frontend Setup

### Installation
```bash
cd frontend
npm install
```

### Configuration

Create `.env.local` file in `frontend/` directory:
```env
# Backend API Configuration
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000

# Polkadot Configuration
NEXT_PUBLIC_WS_PROVIDER=wss://rpc1.paseo.popnetwork.xyz
NEXT_PUBLIC_CONTRACT_ADDRESS=your_deployed_contract_address

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
cp ../contract/target/ink/authentify.json ./public/contract-metadata.json
```

### Running the Frontend
```bash
npm run dev
```

Frontend will start on `http://localhost:3000`

---

## 🔗 How Components Connect

### Registration Flow
```
1. User (Frontend) → Clicks "Sign Up"
2. Frontend → Requests wallet connection (MetaMask/Polkadot.js)
3. User → Approves wallet connection
4. Frontend → Sends wallet address + username + password to Backend
5. Backend → Hashes password → Calls smart contract register_user()
6. Smart Contract → Stores wallet address + password hash on-chain
7. Backend → Creates user in Supabase → Generates JWT token
8. Frontend → Receives JWT → User is logged in
```

### Login Flow
```
1. User (Frontend) → Enters username + password
2. Frontend → Sends credentials to Backend
3. Backend → Hashes password → Calls smart contract verify_password()
4. Smart Contract → Verifies credentials on-chain → Returns success/failure
5. Backend → Generates JWT token → Returns to Frontend
6. Frontend → Stores JWT → User is logged in
```

### Transaction Signing Flow
```
1. User (Frontend) → Clicks "Mint NFT" or "Swap Token"
2. Frontend → Checks JWT validity with Backend
3. Backend → Validates JWT → Returns success
4. Frontend → Shows wallet popup (MetaMask/Polkadot.js)
5. User → Signs transaction with wallet
6. Smart Contract → Executes transaction on blockchain
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

function YourComponent() {
  const { user, login, logout, isAuthenticated } = useAuth();

  return (
    <div>
      {isAuthenticated ? (
        <p>Welcome, {user.username}!</p>
      ) : (
        <button onClick={() => login('username', 'password')}>Login</button>
      )}
    </div>
  );
}
```

---

## 🧪 Testing
```bash
# Backend tests
cd backend && npm test

# Frontend tests
cd frontend && npm test

# Contract tests
cd contract && cargo test
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

**Made with ❤️ by the Authentify Team**

*Bridging Web2 simplicity with Web3 security*