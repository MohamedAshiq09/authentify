#![cfg_attr(not(feature = "std"), no_std, no_main)]

#[ink::contract]
mod authentify {
    use ink::storage::Mapping;
    use ink::prelude::string::String;

    /// Represents a user's complete identity information
    #[derive(Debug, Clone, PartialEq, scale::Encode, scale::Decode)]
    #[cfg_attr(
        feature = "std",
        derive(scale_info::TypeInfo, ink::storage::traits::StorageLayout)
    )]
    pub struct IdentityInfo {
        /// Unique username for login
        pub username: String,
        /// Bcrypt hashed password (hashed off-chain)
        pub password_hash: String,
        /// Hash of social ID (e.g., hash of "google:user@gmail.com")
        pub social_id_hash: String,
        /// Social provider type (google, github, twitter, etc.)
        pub social_provider: String,
        /// The wallet address that owns this identity
        pub wallet_address: AccountId,
        /// Whether identity has been verified by admin
        pub is_verified: bool,
        /// Timestamp when identity was created
        pub created_at: u64,
        /// Timestamp of last login attempt
        pub last_login: u64,
        /// Number of failed login attempts (for security)
        pub failed_attempts: u32,
        /// Whether account is locked due to too many failed attempts
        pub is_locked: bool,
    }

    /// Session information for active users
    #[derive(Debug, Clone, PartialEq, scale::Encode, scale::Decode)]
    #[cfg_attr(
        feature = "std",
        derive(scale_info::TypeInfo, ink::storage::traits::StorageLayout)
    )]
    pub struct SessionInfo {
        pub account: AccountId,
        pub session_id: String,
        pub created_at: u64,
        pub expires_at: u64,
        pub is_active: bool,
    }

    /// Main contract storage
    #[ink(storage)]
    pub struct Authentify {
        /// Maps AccountId to IdentityInfo
        identities: Mapping<AccountId, IdentityInfo>,
        /// Maps username (lowercase) to AccountId for quick lookup
        username_to_account: Mapping<String, AccountId>,
        /// Maps social_id_hash to AccountId to prevent duplicate social accounts
        social_to_account: Mapping<String, AccountId>,
        /// Maps session_id to SessionInfo for session management
        sessions: Mapping<String, SessionInfo>,
        /// Admin address who can verify identities
        admin: AccountId,
        /// Total number of registered users
        total_users: u64,
        /// Total number of active sessions
        active_sessions: u64,
        /// Maximum failed login attempts before lockout
        max_failed_attempts: u32,
        /// Lockout duration in milliseconds
        lockout_duration: u64,
    }

    /// Events emitted by the contract
    #[ink(event)]
    pub struct IdentityRegistered {
        #[ink(topic)]
        account: AccountId,
        #[ink(topic)]
        username: String,
        social_provider: String,
        timestamp: u64,
    }

    #[ink(event)]
    pub struct IdentityVerified {
        #[ink(topic)]
        account: AccountId,
        verified_by: AccountId,
        timestamp: u64,
    }

    #[ink(event)]
    pub struct LoginSuccessful {
        #[ink(topic)]
        account: AccountId,
        #[ink(topic)]
        username: String,
        timestamp: u64,
    }

    #[ink(event)]
    pub struct LoginFailed {
        #[ink(topic)]
        username: String,
        reason: String,
        timestamp: u64,
    }

    #[ink(event)]
    pub struct AccountLocked {
        #[ink(topic)]
        account: AccountId,
        #[ink(topic)]
        username: String,
        reason: String,
        timestamp: u64,
    }

    #[ink(event)]
    pub struct AccountUnlocked {
        #[ink(topic)]
        account: AccountId,
        timestamp: u64,
    }

    #[ink(event)]
    pub struct SessionCreated {
        #[ink(topic)]
        account: AccountId,
        session_id: String,
        expires_at: u64,
    }

    #[ink(event)]
    pub struct SessionRevoked {
        #[ink(topic)]
        session_id: String,
        timestamp: u64,
    }

    #[ink(event)]
    pub struct PasswordChanged {
        #[ink(topic)]
        account: AccountId,
        timestamp: u64,
    }

    /// Error types
    #[derive(Debug, PartialEq, Eq, scale::Encode, scale::Decode)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
    pub enum Error {
        /// Identity already exists for this account
        IdentityAlreadyExists,
        /// Username is already taken
        UsernameAlreadyTaken,
        /// Social ID already bound to another account
        SocialIdAlreadyBound,
        /// Identity not found
        IdentityNotFound,
        /// Invalid credentials provided
        InvalidCredentials,
        /// Not authorized to perform this action
        Unauthorized,
        /// Username cannot be empty
        EmptyUsername,
        /// Password hash cannot be empty
        EmptyPasswordHash,
        /// Social ID hash cannot be empty
        EmptySocialIdHash,
        /// Username too short (minimum 3 characters)
        UsernameTooShort,
        /// Username too long (maximum 32 characters)
        UsernameTooLong,
        /// Username contains invalid characters
        InvalidUsernameFormat,
        /// Account is locked due to too many failed attempts
        AccountLocked,
        /// Session not found
        SessionNotFound,
        /// Session expired
        SessionExpired,
        /// Session already revoked
        SessionAlreadyRevoked,
    }

    pub type Result<T> = core::result::Result<T, Error>;

    impl Default for Authentify {
        fn default() -> Self {
            Self::new()
        }
    }

    impl Authentify {
        /// Constructor - initializes the contract with default settings
        #[ink(constructor)]
        pub fn new() -> Self {
            Self {
                identities: Mapping::default(),
                username_to_account: Mapping::default(),
                social_to_account: Mapping::default(),
                sessions: Mapping::default(),
                admin: Self::env().caller(),
                total_users: 0,
                active_sessions: 0,
                max_failed_attempts: 5,
                lockout_duration: 900000, // 15 minutes in milliseconds
            }
        }

        /// Alternative constructor with custom settings
        #[ink(constructor)]
        pub fn new_with_config(
            max_failed_attempts: u32,
            lockout_duration: u64,
        ) -> Self {
            Self {
                identities: Mapping::default(),
                username_to_account: Mapping::default(),
                social_to_account: Mapping::default(),
                sessions: Mapping::default(),
                admin: Self::env().caller(),
                total_users: 0,
                active_sessions: 0,
                max_failed_attempts,
                lockout_duration,
            }
        }

        // ========================================
        // REGISTRATION FUNCTIONS
        // ========================================

        /// Register a new identity (called during user registration)
        /// 
        /// # Arguments
        /// * `username` - User's chosen username (3-32 chars, alphanumeric + underscore)
        /// * `password_hash` - Bcrypt hashed password (hashed client-side)
        /// * `social_id_hash` - Hash of social identifier (e.g., hash of "google:user@gmail.com")
        /// * `social_provider` - Social provider name (google, github, twitter, etc.)
        /// 
        /// # Returns
        /// * `Ok(())` if registration successful
        /// * `Err(Error)` if validation fails
        #[ink(message)]
        pub fn register_identity(
            &mut self,
            username: String,
            password_hash: String,
            social_id_hash: String,
            social_provider: String,
        ) -> Result<()> {
            let caller = self.env().caller();
            let timestamp = self.env().block_timestamp();

            // Validate inputs
            self.validate_username(&username)?;
            self.validate_password_hash(&password_hash)?;
            self.validate_social_id_hash(&social_id_hash)?;

            // Convert username to lowercase for case-insensitive lookup
            let username_lower = username.to_lowercase();

            // Check if identity already exists
            if self.identities.contains(caller) {
                return Err(Error::IdentityAlreadyExists);
            }

            // Check if username is already taken
            if self.username_to_account.contains(&username_lower) {
                return Err(Error::UsernameAlreadyTaken);
            }

            // Check if social ID is already bound
            if self.social_to_account.contains(&social_id_hash) {
                return Err(Error::SocialIdAlreadyBound);
            }

            // Create identity
            let identity = IdentityInfo {
                username: username.clone(),
                password_hash,
                social_id_hash: social_id_hash.clone(),
                social_provider: social_provider.clone(),
                wallet_address: caller,
                is_verified: false, // Requires admin verification
                created_at: timestamp,
                last_login: 0,
                failed_attempts: 0,
                is_locked: false,
            };

            // Store identity mappings
            self.identities.insert(caller, &identity);
            self.username_to_account.insert(&username_lower, &caller);
            self.social_to_account.insert(&social_id_hash, &caller);
            self.total_users = self.total_users.saturating_add(1);

            // Emit event
            self.env().emit_event(IdentityRegistered {
                account: caller,
                username,
                social_provider,
                timestamp,
            });

            Ok(())
        }

        // ========================================
        // AUTHENTICATION FUNCTIONS
        // ========================================

        /// Authenticate a user by username and password hash
        /// Returns account address if successful
        /// 
        /// # Arguments
        /// * `username` - User's username
        /// * `password_hash` - Bcrypt hashed password to verify
        /// 
        /// # Returns
        /// * `Ok(AccountId)` if authentication successful
        /// * `Err(Error)` if authentication fails
        #[ink(message)]
        pub fn authenticate(
            &mut self,
            username: String,
            password_hash: String,
        ) -> Result<AccountId> {
            let timestamp = self.env().block_timestamp();
            let username_lower = username.to_lowercase();

            // Get account from username
            let account = self.username_to_account.get(&username_lower)
                .ok_or(Error::IdentityNotFound)?;

            // Get identity
            let mut identity = self.identities.get(account)
                .ok_or(Error::IdentityNotFound)?;

            // Check if account is locked
            if identity.is_locked {
                // Check if lockout period has passed
                if timestamp < identity.last_login.saturating_add(self.lockout_duration) {
                    self.env().emit_event(LoginFailed {
                        username: username.clone(),
                        reason: String::from("Account locked"),
                        timestamp,
                    });
                    return Err(Error::AccountLocked);
                } else {
                    // Unlock account if lockout period passed
                    identity.is_locked = false;
                    identity.failed_attempts = 0;
                }
            }

            // Verify password hash
            if identity.password_hash != password_hash {
                // Increment failed attempts
                identity.failed_attempts = identity.failed_attempts.saturating_add(1);
                identity.last_login = timestamp;

                // Lock account if max attempts reached
                if identity.failed_attempts >= self.max_failed_attempts {
                    identity.is_locked = true;
                    self.env().emit_event(AccountLocked {
                        account,
                        username: username.clone(),
                        reason: String::from("Too many failed login attempts"),
                        timestamp,
                    });
                }

                self.identities.insert(account, &identity);
                self.env().emit_event(LoginFailed {
                    username,
                    reason: String::from("Invalid password"),
                    timestamp,
                });
                return Err(Error::InvalidCredentials);
            }

            // Successful login - reset failed attempts
            identity.failed_attempts = 0;
            identity.last_login = timestamp;
            self.identities.insert(account, &identity);

            // Emit success event
            self.env().emit_event(LoginSuccessful {
                account,
                username,
                timestamp,
            });

            Ok(account)
        }

        /// Verify password for an account (used by backend for additional checks)
        #[ink(message)]
        pub fn verify_password(
            &self,
            account: AccountId,
            password_hash: String,
        ) -> Result<bool> {
            let identity = self.identities.get(account)
                .ok_or(Error::IdentityNotFound)?;

            if identity.is_locked {
                return Err(Error::AccountLocked);
            }

            Ok(identity.password_hash == password_hash)
        }

        // ========================================
        // SESSION MANAGEMENT
        // ========================================

        /// Create a new session after successful authentication
        #[ink(message)]
        pub fn create_session(
            &mut self,
            account: AccountId,
            session_id: String,
            duration_ms: u64,
        ) -> Result<()> {
            let timestamp = self.env().block_timestamp();
            let expires_at = timestamp.saturating_add(duration_ms);

            let session = SessionInfo {
                account,
                session_id: session_id.clone(),
                created_at: timestamp,
                expires_at,
                is_active: true,
            };

            self.sessions.insert(&session_id, &session);
            self.active_sessions = self.active_sessions.saturating_add(1);

            self.env().emit_event(SessionCreated {
                account,
                session_id,
                expires_at,
            });

            Ok(())
        }

        /// Verify if a session is valid
        #[ink(message)]
        pub fn verify_session(&self, session_id: String) -> Result<AccountId> {
            let session = self.sessions.get(&session_id)
                .ok_or(Error::SessionNotFound)?;

            if !session.is_active {
                return Err(Error::SessionAlreadyRevoked);
            }

            let timestamp = self.env().block_timestamp();
            if timestamp > session.expires_at {
                return Err(Error::SessionExpired);
            }

            Ok(session.account)
        }

        /// Revoke a session (logout)
        #[ink(message)]
        pub fn revoke_session(&mut self, session_id: String) -> Result<()> {
            let mut session = self.sessions.get(&session_id)
                .ok_or(Error::SessionNotFound)?;

            if !session.is_active {
                return Err(Error::SessionAlreadyRevoked);
            }

            session.is_active = false;
            self.sessions.insert(&session_id, &session);
            self.active_sessions = self.active_sessions.saturating_sub(1);

            self.env().emit_event(SessionRevoked {
                session_id,
                timestamp: self.env().block_timestamp(),
            });

            Ok(())
        }

        // ========================================
        // IDENTITY MANAGEMENT
        // ========================================

        /// Change password for an account
        #[ink(message)]
        pub fn change_password(
            &mut self,
            old_password_hash: String,
            new_password_hash: String,
        ) -> Result<()> {
            let caller = self.env().caller();
            let timestamp = self.env().block_timestamp();

            let mut identity = self.identities.get(caller)
                .ok_or(Error::IdentityNotFound)?;

            // Verify old password
            if identity.password_hash != old_password_hash {
                return Err(Error::InvalidCredentials);
            }

            // Validate new password hash
            self.validate_password_hash(&new_password_hash)?;

            // Update password
            identity.password_hash = new_password_hash;
            self.identities.insert(caller, &identity);

            self.env().emit_event(PasswordChanged {
                account: caller,
                timestamp,
            });

            Ok(())
        }

        /// Unlock a locked account (admin only or after timeout)
        #[ink(message)]
        pub fn unlock_account(&mut self, account: AccountId) -> Result<()> {
            let caller = self.env().caller();
            let timestamp = self.env().block_timestamp();

            // Only admin can manually unlock
            if caller != self.admin {
                return Err(Error::Unauthorized);
            }

            let mut identity = self.identities.get(account)
                .ok_or(Error::IdentityNotFound)?;

            identity.is_locked = false;
            identity.failed_attempts = 0;
            self.identities.insert(account, &identity);

            self.env().emit_event(AccountUnlocked {
                account,
                timestamp,
            });

            Ok(())
        }

        /// Verify an identity (mark as verified by admin)
        #[ink(message)]
        pub fn verify_identity(&mut self, account: AccountId) -> Result<()> {
            let caller = self.env().caller();
            let timestamp = self.env().block_timestamp();

            // Only admin can verify
            if caller != self.admin {
                return Err(Error::Unauthorized);
            }

            let mut identity = self.identities.get(account)
                .ok_or(Error::IdentityNotFound)?;

            identity.is_verified = true;
            self.identities.insert(account, &identity);

            self.env().emit_event(IdentityVerified {
                account,
                verified_by: caller,
                timestamp,
            });

            Ok(())
        }

        // ========================================
        // QUERY FUNCTIONS (Read-only)
        // ========================================

        /// Get complete identity information for an account
        #[ink(message)]
        pub fn get_identity(&self, account: AccountId) -> Option<IdentityInfo> {
            self.identities.get(account)
        }

        /// Get account address by username
        #[ink(message)]
        pub fn get_account_by_username(&self, username: String) -> Option<AccountId> {
            let username_lower = username.to_lowercase();
            self.username_to_account.get(&username_lower)
        }

        /// Get account by social ID hash
        #[ink(message)]
        pub fn get_account_by_social(&self, social_id_hash: String) -> Option<AccountId> {
            self.social_to_account.get(&social_id_hash)
        }

        /// Check if username is available
        #[ink(message)]
        pub fn is_username_available(&self, username: String) -> bool {
            let username_lower = username.to_lowercase();
            !self.username_to_account.contains(&username_lower)
        }

        /// Check if social ID is already bound
        #[ink(message)]
        pub fn is_social_id_available(&self, social_id_hash: String) -> bool {
            !self.social_to_account.contains(&social_id_hash)
        }

        /// Check if account has registered identity
        #[ink(message)]
        pub fn has_identity(&self, account: AccountId) -> bool {
            self.identities.contains(account)
        }

        /// Get total number of registered users
        #[ink(message)]
        pub fn get_total_users(&self) -> u64 {
            self.total_users
        }

        /// Get number of active sessions
        #[ink(message)]
        pub fn get_active_sessions(&self) -> u64 {
            self.active_sessions
        }

        /// Get contract admin address
        #[ink(message)]
        pub fn get_admin(&self) -> AccountId {
            self.admin
        }

        /// Get max failed attempts setting
        #[ink(message)]
        pub fn get_max_failed_attempts(&self) -> u32 {
            self.max_failed_attempts
        }

        /// Get lockout duration setting
        #[ink(message)]
        pub fn get_lockout_duration(&self) -> u64 {
            self.lockout_duration
        }

        // ========================================
        // ADMIN FUNCTIONS
        // ========================================

        /// Transfer admin role to another account
        #[ink(message)]
        pub fn transfer_admin(&mut self, new_admin: AccountId) -> Result<()> {
            let caller = self.env().caller();

            if caller != self.admin {
                return Err(Error::Unauthorized);
            }

            self.admin = new_admin;
            Ok(())
        }

        /// Update max failed attempts setting
        #[ink(message)]
        pub fn update_max_failed_attempts(&mut self, new_max: u32) -> Result<()> {
            let caller = self.env().caller();

            if caller != self.admin {
                return Err(Error::Unauthorized);
            }

            self.max_failed_attempts = new_max;
            Ok(())
        }

        /// Update lockout duration setting
        #[ink(message)]
        pub fn update_lockout_duration(&mut self, new_duration: u64) -> Result<()> {
            let caller = self.env().caller();

            if caller != self.admin {
                return Err(Error::Unauthorized);
            }

            self.lockout_duration = new_duration;
            Ok(())
        }

        // ========================================
        // VALIDATION HELPERS (Private)
        // ========================================

        fn validate_username(&self, username: &str) -> Result<()> {
            if username.is_empty() {
                return Err(Error::EmptyUsername);
            }

            if username.len() < 3 {
                return Err(Error::UsernameTooShort);
            }

            if username.len() > 32 {
                return Err(Error::UsernameTooLong);
            }

            // Check if username contains only alphanumeric and underscore
            if !username.chars().all(|c| c.is_alphanumeric() || c == '_') {
                return Err(Error::InvalidUsernameFormat);
            }

            Ok(())
        }

        fn validate_password_hash(&self, password_hash: &str) -> Result<()> {
            if password_hash.is_empty() {
                return Err(Error::EmptyPasswordHash);
            }

            // Allow any non-empty password hash for flexibility
            // In production, you might want stricter validation
            if password_hash.len() < 4 {
                return Err(Error::EmptyPasswordHash);
            }

            Ok(())
        }

        fn validate_social_id_hash(&self, social_id_hash: &str) -> Result<()> {
            if social_id_hash.is_empty() {
                return Err(Error::EmptySocialIdHash);
            }

            Ok(())
        }
    }

    // ========================================
    // UNIT TESTS
    // ========================================

    #[cfg(test)]
    mod tests {
        use super::*;

        fn create_test_accounts() -> ink::env::test::DefaultAccounts<ink::env::DefaultEnvironment> {
            ink::env::test::default_accounts::<ink::env::DefaultEnvironment>()
        }

        fn set_sender(sender: AccountId) {
            ink::env::test::set_caller::<ink::env::DefaultEnvironment>(sender);
        }

        #[ink::test]
        fn test_new_works() {
            let authentify = Authentify::new();
            assert_eq!(authentify.get_total_users(), 0);
            assert_eq!(authentify.get_active_sessions(), 0);
            assert_eq!(authentify.get_max_failed_attempts(), 5);
        }

        #[ink::test]
        fn test_register_identity_works() {
            let accounts = create_test_accounts();
            set_sender(accounts.alice);
            let mut authentify = Authentify::new();

            let result = authentify.register_identity(
                String::from("alice"),
                String::from("$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy"),
                String::from("social_hash_123"),
                String::from("google"),
            );

            assert!(result.is_ok());
            assert_eq!(authentify.get_total_users(), 1);
            assert!(authentify.has_identity(accounts.alice));
        }

        #[ink::test]
        fn test_username_validation() {
            let accounts = create_test_accounts();
            set_sender(accounts.alice);
            let mut authentify = Authentify::new();

            // Empty username
            let result = authentify.register_identity(
                String::from(""),
                String::from("valid_hash"),
                String::from("social_hash"),
                String::from("google"),
            );
            assert_eq!(result, Err(Error::EmptyUsername));

            // Too short
            let result = authentify.register_identity(
                String::from("ab"),
                String::from("valid_hash"),
                String::from("social_hash"),
                String::from("google"),
            );
            assert_eq!(result, Err(Error::UsernameTooShort));

            // Invalid characters
            let result = authentify.register_identity(
                String::from("alice@123"),
                String::from("valid_hash"),
                String::from("social_hash"),
                String::from("google"),
            );
            assert_eq!(result, Err(Error::InvalidUsernameFormat));
        }

        #[ink::test]
        fn test_duplicate_username_fails() {
            let accounts = create_test_accounts();
            set_sender(accounts.alice);
            let mut authentify = Authentify::new();

            // First registration
            let _ = authentify.register_identity(
                String::from("alice"),
                String::from("valid_hash_1"),
                String::from("social1"),
                String::from("google"),
            );

            // Try same username with different account
            set_sender(accounts.bob);
            let result = authentify.register_identity(
                String::from("alice"),
                String::from("valid_hash_2"),
                String::from("social2"),
                String::from("github"),
            );

            assert_eq!(result, Err(Error::UsernameAlreadyTaken));
        }

        #[ink::test]
        fn test_authenticate_works() {
            let accounts = create_test_accounts();
            set_sender(accounts.alice);
            let mut authentify = Authentify::new();
            let password_hash = String::from("correct_password_hash");

            // Register
            let _ = authentify.register_identity(
                String::from("alice"),
                password_hash.clone(),
                String::from("social_hash"),
                String::from("google"),
            );

            // Authenticate with correct password
            let result = authentify.authenticate(
                String::from("alice"),
                password_hash.clone(),
            );
            assert_eq!(result, Ok(accounts.alice));

            // Authenticate with wrong password
            let result = authentify.authenticate(
                String::from("alice"),
                String::from("wrong_password_hash"),
            );
            assert_eq!(result, Err(Error::InvalidCredentials));
        }

        #[ink::test]
        fn test_account_lockout() {
            let accounts = create_test_accounts();
            set_sender(accounts.alice);
            let mut authentify = Authentify::new();

            // Register
            let _ = authentify.register_identity(
                String::from("alice"),
                String::from("correct_password_hash"),
                String::from("social_hash"),
                String::from("google"),
            );

            // Try wrong password 5 times
            for _ in 0..5 {
                let _ = authentify.authenticate(
                    String::from("alice"),
                    String::from("wrong_password_hash"),
                );
            }

            // 6th attempt should return AccountLocked
            let result = authentify.authenticate(
                String::from("alice"),
                String::from("wrong_password_hash"),
            );
            assert_eq!(result, Err(Error::AccountLocked));
        }

        #[ink::test]
        fn test_username_case_insensitive() {
            let accounts = create_test_accounts();
            set_sender(accounts.alice);
            let mut authentify = Authentify::new();

            // Register with "Alice"
            let _ = authentify.register_identity(
                String::from("Alice"),
                String::from("valid_hash_1"),
                String::from("social1"),
                String::from("google"),
            );

            // Try to register "alice" (lowercase)
            set_sender(accounts.bob);
            let result = authentify.register_identity(
                String::from("alice"),
                String::from("valid_hash_2"),
                String::from("social2"),
                String::from("github"),
            );

            assert_eq!(result, Err(Error::UsernameAlreadyTaken));
        }

        #[ink::test]
        fn test_change_password() {
            let accounts = create_test_accounts();
            set_sender(accounts.alice);
            let mut authentify = Authentify::new();
            let old_hash = String::from("old_password_hash");
            let new_hash = String::from("new_password_hash");

            // Register
            let _ = authentify.register_identity(
                String::from("alice"),
                old_hash.clone(),
                String::from("social_hash"),
                String::from("google"),
            );

            // Change password
            let result = authentify.change_password(old_hash, new_hash.clone());
            assert!(result.is_ok());

            // Verify new password works
            let result = authentify.authenticate(
                String::from("alice"),
                new_hash,
            );
            assert_eq!(result, Ok(accounts.alice));
        }

        #[ink::test]
        fn test_verify_identity() {
            let accounts = create_test_accounts();
            set_sender(accounts.alice);
            let mut authentify = Authentify::new();

            // Register
            let _ = authentify.register_identity(
                String::from("alice"),
                String::from("valid_password_hash"),
                String::from("social_hash"),
                String::from("google"),
            );

            // Check not verified
            let identity = authentify.get_identity(accounts.alice).unwrap();
            assert!(!identity.is_verified);

            // Verify (as admin)
            let result = authentify.verify_identity(accounts.alice);
            assert!(result.is_ok());

            // Check now verified
            let identity = authentify.get_identity(accounts.alice).unwrap();
            assert!(identity.is_verified);
        }

        #[ink::test]
        fn test_is_username_available() {
            let accounts = create_test_accounts();
            set_sender(accounts.alice);
            let mut authentify = Authentify::new();

            assert!(authentify.is_username_available(String::from("alice")));

            let _ = authentify.register_identity(
                String::from("alice"),
                String::from("valid_password_hash"),
                String::from("social_hash"),
                String::from("google"),
            );

            assert!(!authentify.is_username_available(String::from("alice")));
            assert!(!authentify.is_username_available(String::from("ALICE"))); // Case insensitive
        }
    }
}