# Authentify Smart Contract

Web3 Authentication Layer for Polkadot - A complete identity management system built with ink! smart contracts.

## Features

✅ **Identity Registration**
- Store wallet address → username → password hash mapping
- Store social ID hash (email/Google/GitHub)
- Verify uniqueness (no duplicate usernames/social IDs)
- Emit registration events

✅ **Basic Authentication Query**
- Verify username exists
- Return account ID for given username
- Check if username is available

✅ **Identity Verification Status**
- Mark identities as verified (by admin)
- Query verification status

✅ **Access Control**
- Admin management
- Permission checks

✅ **Security Features**
- Account lockout after failed attempts
- Session management
- Password change functionality
- Case-insensitive username handling

## Quick Start

### 1. Build Contract

```bash
# Make scripts executable
chmod +x scripts/*.sh

# Build the contract
./scripts/build.sh
```

### 2. Run Tests

```bash
./scripts/test.sh
```

### 3. Deploy Contract

```bash
# Start local substrate node first
substrate-contracts-node --dev

# Deploy contract
./scripts/deploy.sh
```

## Contract Functions

### Registration
- `register_identity(username, password_hash, social_id_hash, social_provider)` - Register new user
- `is_username_available(username)` - Check username availability
- `is_social_id_available(social_id_hash)` - Check social ID availability

### Authentication
- `authenticate(username, password_hash)` - Authenticate user
- `verify_password(account, password_hash)` - Verify password for account

### Identity Management
- `verify_identity(account)` - Mark identity as verified (admin only)
- `change_password(old_hash, new_hash)` - Change user password
- `unlock_account(account)` - Unlock locked account (admin only)

### Session Management
- `create_session(account, session_id, duration_ms)` - Create new session
- `verify_session(session_id)` - Verify session validity
- `revoke_session(session_id)` - Revoke/logout session

### Query Functions
- `get_identity(account)` - Get complete identity info
- `get_account_by_username(username)` - Get account by username
- `get_account_by_social(social_id_hash)` - Get account by social ID
- `has_identity(account)` - Check if account has identity
- `get_total_users()` - Get total registered users
- `get_active_sessions()` - Get active session count

### Admin Functions
- `transfer_admin(new_admin)` - Transfer admin role
- `update_max_failed_attempts(new_max)` - Update lockout settings
- `update_lockout_duration(new_duration)` - Update lockout duration

## Events

- `IdentityRegistered` - New user registered
- `IdentityVerified` - Identity verified by admin
- `LoginSuccessful` - Successful authentication
- `LoginFailed` - Failed authentication attempt
- `AccountLocked` - Account locked due to failed attempts
- `AccountUnlocked` - Account unlocked by admin
- `SessionCreated` - New session created
- `SessionRevoked` - Session revoked/logout
- `PasswordChanged` - Password updated

## Error Handling

The contract includes comprehensive error handling for:
- Duplicate usernames/social IDs
- Invalid credentials
- Account lockouts
- Session management
- Authorization checks
- Input validation

## Security Features

- **Account Lockout**: Accounts are locked after 5 failed login attempts
- **Lockout Duration**: 15 minutes default lockout period
- **Case-Insensitive Usernames**: Prevents duplicate usernames with different cases
- **Password Validation**: Ensures proper password hash format
- **Admin Controls**: Only admin can verify identities and unlock accounts

## Testing

The contract includes comprehensive unit tests covering:
- Registration flow
- Authentication
- Username validation
- Account lockout mechanism
- Case-insensitive username handling
- Password changes
- Identity verification

Run tests with:
```bash
cargo test --release
```

## Deployment

### Local Development
```bash
# Start local node
substrate-contracts-node --dev

# Deploy
cargo contract instantiate --constructor new --suri //Alice --skip-confirm --execute
```

### Testnet Deployment
```bash
# Deploy to Westend testnet
cargo contract instantiate \
    --constructor new \
    --url wss://westend-rpc.polkadot.io \
    --suri "your mnemonic phrase here" \
    --skip-confirm \
    --execute
```

## Contract Size & Gas Estimates

- **Contract Size**: ~23 KB (optimized)
- **Deployment Gas**: ~500,000,000 (0.0005 DOT)
- **Function Gas Costs**:
  - `register_identity`: ~100,000,000
  - `authenticate`: ~50,000,000
  - `create_session`: ~30,000,000
  - `verify_identity`: ~40,000,000
  - Query functions: 0 (read-only)

## License

MIT License