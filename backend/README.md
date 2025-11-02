# Authentify Backend

A comprehensive TypeScript backend for decentralized identity authentication system with OAuth integration, JWT sessions, and smart contract interaction.

---

## 🎯 What is This Backend For?

The Authentify backend serves as the **critical bridge** between your frontend, blockchain smart contracts, and external authentication providers. It handles all sensitive operations that cannot be performed client-side for security reasons.

### Core Purposes:

1. **Security Layer** - Protects sensitive operations like password hashing, private key management, and API secrets
2. **Authentication Hub** - Manages user sessions, OAuth flows, and JWT token generation
3. **Contract Proxy** - Interacts with blockchain using a service account (users don't need to pay gas fees for registration)
4. **SDK Gateway** - Provides API keys and manages access for dApps integrating Authentify
5. **Data Management** - Caches contract events and analytics in a fast, queryable database

---

## 🔄 How Does This Backend Work?

### **1. Authentication Flow**

**Email/Password Registration:**
- User submits email and password to backend
- Backend hashes password using bcrypt (never stores plain text)
- Creates user record in Supabase database
- Calls smart contract to register user on blockchain
- Generates JWT access token (15min) and refresh token (7 days)
- Returns tokens to frontend for session management

**OAuth Login (Google/GitHub/Twitter):**
- User clicks "Login with Google" on frontend
- Frontend redirects to OAuth provider
- Provider redirects back with authorization code
- Backend exchanges code for user profile data
- Checks if user exists in database, creates if new
- Registers user on smart contract if first time
- Returns JWT tokens to frontend

**Session Management:**
- Every API request includes JWT token in Authorization header
- Backend validates token signature and expiration
- If expired, frontend uses refresh token to get new access token
- User can logout from single device or all devices simultaneously

---

### **2. Smart Contract Interaction**

**Why Backend Handles This:**
- Users shouldn't need cryptocurrency to register
- Private keys must never be exposed to frontend
- Backend uses a "service account" wallet to pay gas fees
- All contract calls are free for end users

**Registration Process:**
- User completes authentication (email/password or OAuth)
- Backend extracts wallet address (from user input or generated)
- Backend calls `contract.register(userAddress, "email")` on blockchain
- Transaction is signed by service account and submitted
- Backend waits for confirmation and stores transaction hash
- Event listener captures `UserRegistered` event for analytics

**Event Listening:**
- Backend continuously listens to contract events in real-time
- Captures `UserRegistered` and `UserLoggedIn` events
- Stores events in database for quick queries and analytics
- Allows frontend to show registration history without blockchain calls

---

### **3. SDK Management System**

**For dApp Developers:**
- Developers register their dApp through backend API
- Backend generates unique Client ID and Client Secret
- These credentials allow dApps to use Authentify authentication
- Backend tracks API usage for analytics and rate limiting

**How It Works:**
- dApp sends authentication request with Client ID
- Backend validates credentials and processes auth
- Backend records API usage (endpoint, timestamp, response time)
- Rate limiting prevents abuse (100 requests per 15 minutes)
- Developers can view analytics dashboard showing usage stats

---

### **4. Database Architecture (Supabase)**

**Why Supabase:**
- PostgreSQL provides powerful relational queries
- Built-in authentication reduces custom code
- Real-time subscriptions for live updates
- Generous free tier with automatic backups

**What's Stored:**

**Users Table:**
- Email, hashed password, wallet address, timestamps
- Links to OAuth accounts and sessions

**OAuth Accounts Table:**
- Provider (google/github/twitter), provider user ID
- Linked to main user account

**Sessions Table:**
- JWT tokens, expiration timestamps, user reference
- Allows multi-device login and logout management

**SDK Clients Table:**
- Client ID/Secret, app name, redirect URLs
- Tracks which dApps are using Authentify

**API Usage Table:**
- Timestamp, endpoint, response time, status code
- Powers analytics dashboard for developers

**Contract Events Table:**
- Cached blockchain events for fast queries
- Block number, transaction hash, user address, event data

---

### **5. Security Features**

**Rate Limiting:**
- Authentication endpoints: 5 requests per 15 minutes per IP
- General endpoints: 100 requests per 15 minutes per IP
- Prevents brute force attacks and API abuse

**Password Security:**
- bcrypt hashing with 10 salt rounds
- Passwords validated for strength (8+ chars, uppercase, lowercase, number)
- Password reset uses time-limited tokens

**JWT Security:**
- Access tokens expire in 15 minutes (short-lived)
- Refresh tokens expire in 7 days (long-lived)
- Separate secrets for each token type
- Tokens include user ID and email claims

**Input Validation:**
- Email format validation with regex
- Ethereum address validation (42 chars, starts with 0x)
- URL validation for redirect URIs
- All inputs sanitized to prevent XSS attacks

**CORS Protection:**
- Only allows requests from configured frontend domain
- Credentials (cookies) only sent to trusted origins

**Helmet Security:**
- Sets security HTTP headers automatically
- Protects against common web vulnerabilities

---

### **6. API Response Flow**

**Every API request follows this pattern:**

1. **Request arrives** → Rate limiting middleware checks limits
2. **Authentication** → JWT middleware validates token (if protected route)
3. **Validation** → Input validation middleware checks request body
4. **Controller** → Route handler processes business logic
5. **Service Layer** → Interacts with database or smart contract
6. **Response** → Standardized JSON format returned to frontend

**Success Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": { "id": "...", "email": "..." },
    "tokens": { "accessToken": "...", "refreshToken": "..." }
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Invalid credentials",
  "errors": { "email": "User not found" }
}
```

---

### **7. Background Processes**

**Event Listener (Production Only):**
- Continuously polls blockchain for new events
- Runs every 60 seconds to check for new blocks
- Caches events in database for instant frontend queries
- Automatically starts when backend launches in production mode

**Session Cleanup:**
- Runs every hour to delete expired sessions
- Keeps database clean and performant
- Prevents stale session accumulation

---

### **8. Development vs Production**

**Development Mode:**
- Detailed error messages with stack traces
- Event listener disabled (manual sync via API)
- Verbose logging for debugging
- CORS allows localhost origins

**Production Mode:**
- Generic error messages (security)
- Event listener runs automatically
- Minimal logging (only errors)
- CORS restricted to production frontend domain
- Environment variables validated on startup

---

## 🚀 Quick Start Summary

1. **Setup Supabase** - Create project, get API keys, run SQL schema
2. **Configure Environment** - Add all required secrets to `.env`
3. **Install Dependencies** - Run `npm install`
4. **Start Server** - Run `npm run dev` for development
5. **Test Endpoints** - Use `/health` to verify backend is running

---

## 📝 Key Takeaway

The backend handles everything your frontend can't do securely: password hashing, blockchain transactions, OAuth flows, and sensitive API operations. It's the secure foundation that makes Authentify work seamlessly while keeping user data safe and transactions free! 🎉