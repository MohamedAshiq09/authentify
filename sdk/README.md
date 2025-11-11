# Authentify SDK

A comprehensive TypeScript SDK for integrating with the Authentify Web3 authentication platform.

## Features

- 🔐 Blockchain-based identity management
- 🚀 Easy API integration
- 🎯 Type-safe TypeScript support
- ⚛️ React hooks (coming soon)
- 📱 Multi-platform support
- 🛡️ Secure session management

## Installation

```bash
npm install authentify-sdk
```

## Quick Start

### Basic Usage

```typescript
import { AuthentifySDK } from "authentify-sdk";

const sdk = new AuthentifySDK({
  apiUrl: "https://api.authentify.example.com",
  apiKey: "your-api-key",
  wsUrl: "ws://localhost:9944", // Optional for contract integration
  contractAddress: "0x...", // Optional contract address
});

// Initialize the SDK
await sdk.initialize();

// Register a new user
const result = await sdk.register({
  username: "johndoe",
  password: "securepassword",
  socialProvider: "github",
  socialId: "john-github-id",
});

// Login
const session = await sdk.login("johndoe", "securepassword");

// Check login status
const isLoggedIn = await sdk.isLoggedIn();

// Logout
await sdk.logout();
```

### Advanced Usage with Contract Integration

```typescript
import { AuthentifySDK, ContractClient } from "authentify-sdk";

const sdk = new AuthentifySDK({
  apiUrl: "https://api.authentify.example.com",
  apiKey: "your-api-key",
  wsUrl: "ws://localhost:9944",
  contractAddress: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
  useContract: true,
});

// Initialize with contract support
await sdk.initialize();

// Register using blockchain
const contractResult = await sdk.registerOnChain({
  username: "blockchainuser",
  password: "securepassword",
  socialProvider: "discord",
  socialId: "discord-user-id",
});

// Authenticate via smart contract
const authResult = await sdk.authenticateOnChain(
  "blockchainuser",
  "securepassword"
);
```

## API Reference

### AuthentifySDK

#### Constructor

```typescript
new AuthentifySDK(config: AuthentifyConfig)
```

**Configuration Options:**

- `apiUrl` (string): Base URL for the Authentify API
- `apiKey` (string): Your API key for authentication
- `wsUrl` (string, optional): WebSocket URL for blockchain connection
- `contractAddress` (string, optional): Smart contract address
- `useContract` (boolean, optional): Enable blockchain integration

#### Methods

##### `initialize(): Promise<void>`

Initialize the SDK and establish connections.

##### `register(data: RegisterData): Promise<UserProfile>`

Register a new user account.

##### `login(username: string, password: string): Promise<AuthSession>`

Authenticate a user and create a session.

##### `logout(): Promise<boolean>`

End the current session.

##### `isLoggedIn(): Promise<boolean>`

Check if user is currently authenticated.

##### `getCurrentUser(): Promise<UserProfile | null>`

Get current user profile information.

##### `changePassword(oldPassword: string, newPassword: string): Promise<boolean>`

Change user password.

##### `refreshSession(): Promise<AuthSession>`

Refresh the current session token.

### Types

#### `AuthentifyConfig`

```typescript
interface AuthentifyConfig {
  apiUrl: string;
  apiKey: string;
  wsUrl?: string;
  contractAddress?: string;
  useContract?: boolean;
}
```

#### `RegisterData`

```typescript
interface RegisterData {
  username: string;
  password: string;
  email?: string;
  socialProvider?: string;
  socialId?: string;
}
```

#### `UserProfile`

```typescript
interface UserProfile {
  id: string;
  username: string;
  email?: string;
  socialProvider?: string;
  isVerified: boolean;
  createdAt: string;
}
```

#### `AuthSession`

```typescript
interface AuthSession {
  sessionId: string;
  accountId: string;
  token: string;
  expiresAt: number;
  isActive: boolean;
}
```

## Error Handling

The SDK uses custom error types for better error handling:

```typescript
import { AuthentifyError } from "authentify-sdk";

try {
  await sdk.login("username", "password");
} catch (error) {
  if (error instanceof AuthentifyError) {
    console.log("Error code:", error.code);
    console.log("Error message:", error.message);
    console.log("Original error:", error.originalError);
  }
}
```

## React Integration (Coming Soon)

```typescript
import { useAuthentify } from "authentify-sdk/react";

function App() {
  const { user, login, logout, isLoading, error } = useAuthentify();

  const handleLogin = async () => {
    try {
      await login("username", "password");
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {user ? (
        <div>
          Welcome {user.username}!<button onClick={logout}>Logout</button>
        </div>
      ) : (
        <button onClick={handleLogin}>Login</button>
      )}
    </div>
  );
}
```

## Development

### Building from Source

```bash
git clone https://github.com/your-org/authentify-sdk
cd authentify-sdk
npm install
npm run build
```

### Testing

```bash
npm run test
```

### Linting

```bash
npm run lint
```

## Browser Support

The SDK supports all modern browsers that support:

- ES2020
- WebAssembly
- WebSockets (for blockchain features)

## Examples

Check out the [examples directory](./examples) for complete integration examples:

- [Basic Web App](./examples/basic-web)
- [React App](./examples/react-app)
- [Node.js Server](./examples/node-server)
- [Blockchain Integration](./examples/blockchain)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- Documentation: [docs.authentify.com](https://docs.authentify.com)
- Issues: [GitHub Issues](https://github.com/your-org/authentify-sdk/issues)
- Discord: [Join our community](https://discord.gg/authentify)
- Email: support@authentify.com
