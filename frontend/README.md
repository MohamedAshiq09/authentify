# Authentify Frontend

A modern Next.js frontend for the Authentify decentralized identity authentication system built on Polkadot.

## 🎯 Frontend Responsibilities

✅ **User Interface**
- Registration flow (3 steps: Wallet → Social → Credentials)
- Login page (email + password)
- Dashboard (user profile)
- SDK Integration demo page

✅ **Wallet Connection**
- Polkadot.js extension integration
- Account selection
- Message signing for registration
- Transaction signing (when needed)

✅ **Client-Side Logic**
- Form validation
- Password hashing (bcrypt before sending to backend)
- Contract interaction via @polkadot/api-contract
- Local state management (Zustand)

✅ **SDK Provider**
- Authentify SDK for dApps
- Client ID generation
- Integration documentation

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Running Authentify backend
- Substrate contracts node (for local development)
- Polkadot.js browser extension

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Update .env with your configuration
# NEXT_PUBLIC_API_URL=http://localhost:5000/api
# NEXT_PUBLIC_WS_PROVIDER=ws://127.0.0.1:9944
# NEXT_PUBLIC_CONTRACT_ADDRESS=your_contract_address

# Start development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
frontend/
├── app/                          # Next.js App Router
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Homepage
│   ├── globals.css              # Global styles
│   ├── login/page.tsx           # Login page
│   ├── register/page.tsx        # Registration page
│   ├── dashboard/page.tsx       # User dashboard
│   └── sdk/page.tsx             # SDK documentation
├── components/                   # Reusable components
│   ├── ui/                      # Base UI components
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── card.tsx
│   │   ├── alert.tsx
│   │   └── spinner.tsx
│   ├── wallet/                  # Wallet components
│   │   ├── wallet-connect.tsx
│   │   └── account-selector.tsx
│   ├── auth/                    # Authentication components
│   │   ├── registration-wizard.tsx
│   │   ├── login-form.tsx
│   │   └── social-auth.tsx
│   └── layout/                  # Layout components
│       ├── header.tsx
│       └── footer.tsx
├── lib/                         # Core utilities
│   ├── api/                     # API clients
│   │   ├── client.ts            # Base API client
│   │   ├── auth.ts              # Auth API
│   │   ├── contract.ts          # Contract API
│   │   ├── session.ts           # Session API
│   │   └── sdk.ts               # SDK API
│   ├── contract/                # Smart contract
│   │   ├── contract.ts          # Contract interactions
│   │   └── metadata.json        # Contract metadata
│   ├── polkadot/               # Polkadot utilities
│   │   ├── connection.ts        # Node connection
│   │   └── wallet.ts            # Wallet utilities
│   ├── store/                   # Zustand stores
│   │   ├── auth-store.ts        # Authentication state
│   │   ├── wallet-store.ts      # Wallet state
│   │   └── contract-store.ts    # Contract state
│   ├── types/                   # TypeScript types
│   │   ├── auth.ts
│   │   ├── contract.ts
│   │   └── wallet.ts
│   └── utils/                   # Utility functions
│       ├── cn.ts                # Class name utility
│       ├── password.ts          # Password utilities
│       └── validation.ts        # Validation utilities
├── hooks/                       # Custom React hooks
│   ├── use-auth.ts             # Authentication hook
│   ├── use-wallet.ts           # Wallet hook
│   └── use-contract.ts         # Contract hook
└── public/                     # Static assets
```

## 🔧 Key Features

### Authentication Flow

1. **Registration (3 Steps)**:
   - **Wallet**: Connect Polkadot.js extension
   - **Social**: Optional OAuth integration
   - **Credentials**: Set email and password

2. **Login**: Email + password authentication

3. **Dashboard**: User profile and wallet management

### Wallet Integration

- **Polkadot.js Extension**: Seamless connection
- **Account Selection**: Choose from multiple accounts
- **Transaction Signing**: For contract interactions
- **Balance Display**: Show account balances

### Smart Contract Integration

- **Contract Queries**: Read-only operations
- **Contract Transactions**: Write operations via backend
- **Event Listening**: Real-time contract events
- **Metadata Management**: Type-safe contract calls

### State Management

- **Zustand Stores**: Lightweight state management
- **Persistent Storage**: LocalStorage integration
- **Real-time Updates**: Automatic state synchronization

## 🎨 UI Components

### Base Components
- `Button`: Customizable button with loading states
- `Input`: Form input with validation
- `Card`: Content containers
- `Alert`: Status messages
- `Spinner`: Loading indicators

### Wallet Components
- `WalletConnect`: Wallet connection interface
- `AccountSelector`: Account selection UI

### Auth Components
- `RegistrationWizard`: Multi-step registration
- `LoginForm`: Login interface
- `SocialAuth`: OAuth integration

## 🔐 Security Features

- **Client-side Password Hashing**: bcrypt before transmission
- **JWT Token Management**: Automatic refresh
- **Input Validation**: Comprehensive form validation
- **XSS Protection**: Sanitized inputs
- **CSRF Protection**: Token-based requests

## 🌐 API Integration

### Authentication API
```typescript
// Register user
await authApi.register({
  email: 'user@example.com',
  password: hashedPassword,
  wallet_address: walletAddress
});

// Login user
await authApi.login({
  email: 'user@example.com',
  password: hashedPassword
});
```

### Contract API
```typescript
// Register on contract
await contractApi.registerUser({
  user_address: walletAddress,
  auth_method: 'email'
});

// Check contract status
const status = await contractApi.getContractStatus();
```

### Wallet Integration
```typescript
// Connect wallet
const accounts = await connect();

// Sign message
const signature = await signMessage(address, message);

// Get balance
const balance = await getBalance(address);
```

## 📱 Responsive Design

- **Mobile-first**: Optimized for mobile devices
- **Tablet Support**: Responsive layouts
- **Desktop**: Full-featured experience
- **Touch-friendly**: Large tap targets

## 🎯 Performance

- **Next.js 14**: App Router for optimal performance
- **Code Splitting**: Automatic route-based splitting
- **Image Optimization**: Next.js image optimization
- **Bundle Analysis**: Webpack bundle analyzer

## 🧪 Development

### Available Scripts

```bash
# Development server
npm run dev

# Production build
npm run build

# Start production server
npm start

# Lint code
npm run lint

# Type checking
npm run type-check
```

### Environment Variables

```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000

# Polkadot Configuration
NEXT_PUBLIC_WS_PROVIDER=ws://127.0.0.1:9944
NEXT_PUBLIC_CONTRACT_ADDRESS=5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY

# App Configuration
NEXT_PUBLIC_APP_NAME=Authentify
NEXT_PUBLIC_APP_VERSION=1.0.0

# OAuth (Optional)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
NEXT_PUBLIC_GITHUB_CLIENT_ID=your_github_client_id
```

## 🚀 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
```

### Docker

```bash
# Build image
docker build -t authentify-frontend .

# Run container
docker run -p 3000:3000 authentify-frontend
```

### Static Export

```bash
# Build static export
npm run build
npm run export

# Deploy static files
```

## 🔗 Integration with Backend

The frontend communicates with the Authentify backend through:

1. **REST API**: Authentication, user management
2. **WebSocket**: Real-time updates (future)
3. **Contract Proxy**: Blockchain interactions

### API Client Configuration

```typescript
// Automatic token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Refresh token and retry
      const newToken = await refreshToken();
      return apiClient(originalRequest);
    }
  }
);
```

## 📚 SDK Integration

The frontend serves as both a user interface and SDK documentation:

```typescript
// Example SDK usage
import { AuthentifySDK } from '@authentify/sdk';

const sdk = new AuthentifySDK({
  clientId: 'your_client_id',
  apiUrl: 'https://api.authentify.dev'
});

// Register user
const user = await sdk.register({
  email: 'user@example.com',
  password: 'securePassword',
  walletAddress: '5GrwvaEF...'
});
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Polkadot**: Blockchain infrastructure
- **ink!**: Smart contract framework
- **Next.js**: React framework
- **Tailwind CSS**: Styling framework
- **Zustand**: State management

---

Built with ❤️ for Polkadot Hackathon 2024