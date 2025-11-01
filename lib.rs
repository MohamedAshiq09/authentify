#![cfg_attr(not(feature = "std"), no_std, no_main)]

#[ink::contract]
mod authentify {
    use ink::storage::Mapping;
    use ink::prelude::string::String;
    use ink::prelude::vec::Vec;

    /// Identity information for a user
    #[derive(Debug, Clone, PartialEq, scale::Encode, scale::Decode)]
    #[cfg_attr(
        feature = "std",
        derive(scale_info::TypeInfo, ink::storage::traits::StorageLayout)
    )]
    pub struct IdentityInfo {
        pub username: String,
        pub password_hash: String,
        pub social_id_hash: String,
        pub wallet_address: AccountId,
        pub is_verified: bool,
        pub created_at: u64,
    }

    /// The Authentify smart contract storage
    #[ink(storage)]
    pub struct Authentify {
        /// Maps AccountId to IdentityInfo
        identities: Mapping<AccountId, IdentityInfo>,
        /// Maps username to AccountId
        username_to_account: Mapping<String, AccountId>,
        /// Maps social_id_hash to AccountId
        social_to_account: Mapping<String, AccountId>,
        /// Admin/Owner of the contract
        admin: AccountId,
        /// Total registered users
        total_users: u64,
    }

    /// Events emitted by the contract
    #[ink(event)]
    pub struct IdentityRegistered {
        #[ink(topic)]
        account: AccountId,
        #[ink(topic)]
        username: String,
        timestamp: u64,
    }

    #[ink(event)]
    pub struct IdentityVerified {
        #[ink(topic)]
        account: AccountId,
        timestamp: u64,
    }

    #[ink(event)]
    pub struct LoginAttempt {
        #[ink(topic)]
        account: AccountId,
        success: bool,
        timestamp: u64,
    }

    /// Errors that can occur
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
        /// Invalid credentials
        InvalidCredentials,
        /// Not authorized (only admin can call)
        Unauthorized,
        /// Username cannot be empty
        EmptyUsername,
        /// Password hash cannot be empty
        EmptyPasswordHash,
    }

    pub type Result<T> = core::result::Result<T, Error>;

    impl Authentify {
        /// Constructor - initializes the contract
        #[ink(constructor)]
        pub fn new() -> Self {
            Self {
                identities: Mapping::default(),
                username_to_account: Mapping::default(),
                social_to_account: Mapping::default(),
                admin: Self::env().caller(),
                total_users: 0,
            }
        }

        /// Register a new identity
        /// 
        /// # Arguments
        /// * `username` - User's chosen username
        /// * `password_hash` - Hashed password (hashing done off-chain)
        /// * `social_id_hash` - Hash of social account identifier
        #[ink(message)]
        pub fn register_identity(
            &mut self,
            username: String,
            password_hash: String,
            social_id_hash: String,
        ) -> Result<()> {
            let caller = self.env().caller();
            let timestamp = self.env().block_timestamp();

            // Validations
            if username.is_empty() {
                return Err(Error::EmptyUsername);
            }
            if password_hash.is_empty() {
                return Err(Error::EmptyPasswordHash);
            }

            // Check if identity already exists
            if self.identities.contains(caller) {
                return Err(Error::IdentityAlreadyExists);
            }

            // Check if username is already taken
            if self.username_to_account.contains(&username) {
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
                wallet_address: caller,
                is_verified: false,
                created_at: timestamp,
            };

            // Store identity
            self.identities.insert(caller, &identity);
            self.username_to_account.insert(username.clone(), &caller);
            self.social_to_account.insert(social_id_hash, &caller);
            self.total_users = self.total_users.saturating_add(1);


            // Emit event
            self.env().emit_event(IdentityRegistered {
                account: caller,
                username,
                timestamp,
            });

            Ok(())
        }

        /// Authenticate a user by username and password
        /// 
        /// # Arguments
        /// * `username` - User's username
        /// * `password_hash` - Hashed password to verify
        #[ink(message)]
        pub fn authenticate(
            &self,
            username: String,
            password_hash: String,
        ) -> Result<bool> {
            let timestamp = self.env().block_timestamp();

            // Get account from username
            let account = self.username_to_account.get(&username)
                .ok_or(Error::IdentityNotFound)?;

            // Get identity
            let identity = self.identities.get(account)
                .ok_or(Error::IdentityNotFound)?;

            // Verify password hash
            let success = identity.password_hash == password_hash;

            // Emit event (note: in real implementation, emit from mutable context)
            if success {
                Ok(true)
            } else {
                Err(Error::InvalidCredentials)
            }
        }

        /// Verify an identity (only admin can call)
        /// 
        /// # Arguments
        /// * `account` - Account to verify
        #[ink(message)]
        pub fn verify_identity(&mut self, account: AccountId) -> Result<()> {
            let caller = self.env().caller();
            
            // Only admin can verify
            if caller != self.admin {
                return Err(Error::Unauthorized);
            }

            // Get and update identity
            let mut identity = self.identities.get(account)
                .ok_or(Error::IdentityNotFound)?;
            
            identity.is_verified = true;
            self.identities.insert(account, &identity);

            // Emit event
            self.env().emit_event(IdentityVerified {
                account,
                timestamp: self.env().block_timestamp(),
            });

            Ok(())
        }

        /// Get identity information by account
        #[ink(message)]
        pub fn get_identity(&self, account: AccountId) -> Option<IdentityInfo> {
            self.identities.get(account)
        }

        /// Get account by username
        #[ink(message)]
        pub fn get_account_by_username(&self, username: String) -> Option<AccountId> {
            self.username_to_account.get(&username)
        }

        /// Check if username is available
        #[ink(message)]
        pub fn is_username_available(&self, username: String) -> bool {
            !self.username_to_account.contains(&username)
        }

        /// Get total registered users
        #[ink(message)]
        pub fn get_total_users(&self) -> u64 {
            self.total_users
        }

        /// Check if account has registered identity
        #[ink(message)]
        pub fn has_identity(&self, account: AccountId) -> bool {
            self.identities.contains(account)
        }

        /// Get contract admin
        #[ink(message)]
        pub fn get_admin(&self) -> AccountId {
            self.admin
        }

        /// Transfer admin role (only current admin can call)
        #[ink(message)]
        pub fn transfer_admin(&mut self, new_admin: AccountId) -> Result<()> {
            let caller = self.env().caller();
            
            if caller != self.admin {
                return Err(Error::Unauthorized);
            }

            self.admin = new_admin;
            Ok(())
        }
    }

    /// Unit tests
    #[cfg(test)]
    mod tests {
        use super::*;

        #[ink::test]
        fn test_new_works() {
            let authentify = Authentify::new();
            assert_eq!(authentify.get_total_users(), 0);
        }

        #[ink::test]
        fn test_register_identity_works() {
            let mut authentify = Authentify::new();
            
            let result = authentify.register_identity(
                String::from("alice"),
                String::from("hash_of_password"),
                String::from("social_hash"),
            );

            assert!(result.is_ok());
            assert_eq!(authentify.get_total_users(), 1);
        }

        #[ink::test]
        fn test_duplicate_username_fails() {
            let mut authentify = Authentify::new();
            
            // First registration
            let _ = authentify.register_identity(
                String::from("alice"),
                String::from("hash1"),
                String::from("social1"),
            );

            // Try to register same username with different account
            let result = authentify.register_identity(
                String::from("alice"),
                String::from("hash2"),
                String::from("social2"),
            );

            assert_eq!(result, Err(Error::UsernameAlreadyTaken));
        }

        #[ink::test]
        fn test_authenticate_works() {
            let mut authentify = Authentify::new();
            
            // Register
            let _ = authentify.register_identity(
                String::from("alice"),
                String::from("correct_hash"),
                String::from("social_hash"),
            );

            // Authenticate with correct password
            let result = authentify.authenticate(
                String::from("alice"),
                String::from("correct_hash"),
            );
            assert_eq!(result, Ok(true));

            // Authenticate with wrong password
            let result = authentify.authenticate(
                String::from("alice"),
                String::from("wrong_hash"),
            );
            assert_eq!(result, Err(Error::InvalidCredentials));
        }

        #[ink::test]
        fn test_username_availability() {
            let mut authentify = Authentify::new();
            
            assert!(authentify.is_username_available(String::from("alice")));
            
            let _ = authentify.register_identity(
                String::from("alice"),
                String::from("hash"),
                String::from("social"),
            );
            
            assert!(!authentify.is_username_available(String::from("alice")));
        }
    }
}