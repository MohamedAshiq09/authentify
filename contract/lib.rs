#![cfg_attr(not(feature = "std"), no_std, no_main)]

#[ink::contract]
mod authentify {
    use ink::prelude::string::String;
    /// A simple authentication contract that stores username->AccountId mappings
    #[ink(storage)]
    pub struct Authentify {
        /// Maps username to AccountId
        users: ink::storage::Mapping<String, AccountId>,
        /// Admin address
        admin: AccountId,
        /// Total number of registered users
        total_users: u32,
    }

    /// Errors that can occur calling this contract
    #[derive(Debug, PartialEq, Eq, parity_scale_codec::Encode, parity_scale_codec::Decode)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
    pub enum Error {
        /// Username already exists
        UsernameExists,
        /// Username not found
        UsernameNotFound,
        /// Not authorized
        Unauthorized,
    }

    /// Type alias for Result
    pub type Result<T> = core::result::Result<T, Error>;

    impl Authentify {
        /// Constructor that initializes the contract
        #[ink(constructor)]
        pub fn new() -> Self {
            Self {
                users: ink::storage::Mapping::default(),
                admin: Self::env().caller(),
                total_users: 0,
            }
        }

        /// Register a new username
        #[ink(message)]
        pub fn register(&mut self, username: String) -> Result<()> {
            let caller = self.env().caller();

            // Check if username already exists
            if self.users.contains(&username) {
                return Err(Error::UsernameExists);
            }

            // Store username -> AccountId mapping
            self.users.insert(&username, &caller);
            self.total_users = self.total_users.saturating_add(1);

            Ok(())
        }

        /// Get AccountId for a username
        #[ink(message)]
        pub fn get_user(&self, username: String) -> Result<AccountId> {
            self.users.get(&username).ok_or(Error::UsernameNotFound)
        }

        /// Check if username exists
        #[ink(message)]
        pub fn username_exists(&self, username: String) -> bool {
            self.users.contains(&username)
        }

        /// Get total users
        #[ink(message)]
        pub fn get_total_users(&self) -> u32 {
            self.total_users
        }

        /// Get admin address
        #[ink(message)]
        pub fn get_admin(&self) -> AccountId {
            self.admin
        }
    }

    #[cfg(test)]
    mod tests {
        use super::*;
        use ink::env::test;

        /// Helper function to get default accounts for testing
        fn default_accounts() -> test::DefaultAccounts<ink::env::DefaultEnvironment> {
            test::default_accounts::<ink::env::DefaultEnvironment>()
        }

        /// Helper function to set caller for testing
        fn set_caller(account_id: AccountId) {
            test::set_caller::<ink::env::DefaultEnvironment>(account_id);
        }

        #[ink::test]
        fn new_works() {
            let authentify = Authentify::new();
            assert_eq!(authentify.get_total_users(), 0);
            
            // Admin should be set to caller
            let accounts = default_accounts();
            assert_eq!(authentify.get_admin(), accounts.alice);
        }

        #[ink::test]
        fn register_works() {
            let mut authentify = Authentify::new();
            let accounts = default_accounts();
            
            // Set caller to alice
            set_caller(accounts.alice);
            
            let result = authentify.register(String::from("alice"));
            assert!(result.is_ok());
            assert_eq!(authentify.get_total_users(), 1);
            
            // Verify user is registered
            assert!(authentify.username_exists(String::from("alice")));
            let user = authentify.get_user(String::from("alice")).unwrap();
            assert_eq!(user, accounts.alice);
        }

        #[ink::test]
        fn register_multiple_users_works() {
            let mut authentify = Authentify::new();
            let accounts = default_accounts();
            
            // Register alice
            set_caller(accounts.alice);
            let result1 = authentify.register(String::from("alice"));
            assert!(result1.is_ok());
            
            // Register bob
            set_caller(accounts.bob);
            let result2 = authentify.register(String::from("bob"));
            assert!(result2.is_ok());
            
            // Register charlie
            set_caller(accounts.charlie);
            let result3 = authentify.register(String::from("charlie"));
            assert!(result3.is_ok());
            
            // Verify all users are registered
            assert_eq!(authentify.get_total_users(), 3);
            assert!(authentify.username_exists(String::from("alice")));
            assert!(authentify.username_exists(String::from("bob")));
            assert!(authentify.username_exists(String::from("charlie")));
            
            // Verify account mappings
            assert_eq!(authentify.get_user(String::from("alice")).unwrap(), accounts.alice);
            assert_eq!(authentify.get_user(String::from("bob")).unwrap(), accounts.bob);
            assert_eq!(authentify.get_user(String::from("charlie")).unwrap(), accounts.charlie);
        }

        #[ink::test]
        fn duplicate_username_fails() {
            let mut authentify = Authentify::new();
            let accounts = default_accounts();
            
            // Register alice first
            set_caller(accounts.alice);
            let result1 = authentify.register(String::from("alice"));
            assert!(result1.is_ok());
            assert_eq!(authentify.get_total_users(), 1);
            
            // Try to register alice again from the same account
            let result2 = authentify.register(String::from("alice"));
            assert_eq!(result2, Err(Error::UsernameExists));
            assert_eq!(authentify.get_total_users(), 1); // Count should not increase
            
            // Try to register alice from a different account
            set_caller(accounts.bob);
            let result3 = authentify.register(String::from("alice"));
            assert_eq!(result3, Err(Error::UsernameExists));
            assert_eq!(authentify.get_total_users(), 1); // Count should not increase
        }

        #[ink::test]
        fn get_user_works() {
            let mut authentify = Authentify::new();
            let accounts = default_accounts();
            
            // Register alice
            set_caller(accounts.alice);
            let _ = authentify.register(String::from("alice"));
            
            // Get user by username
            let result = authentify.get_user(String::from("alice"));
            assert!(result.is_ok());
            assert_eq!(result.unwrap(), accounts.alice);
        }

        #[ink::test]
        fn get_user_not_found() {
            let authentify = Authentify::new();
            
            // Try to get non-existent user
            let result = authentify.get_user(String::from("nonexistent"));
            assert_eq!(result, Err(Error::UsernameNotFound));
        }

        #[ink::test]
        fn username_exists_works() {
            let mut authentify = Authentify::new();
            let accounts = default_accounts();
            
            // Initially no users exist
            assert!(!authentify.username_exists(String::from("alice")));
            assert!(!authentify.username_exists(String::from("bob")));
            
            // Register alice
            set_caller(accounts.alice);
            let _ = authentify.register(String::from("alice"));
            
            // Now alice exists but bob doesn't
            assert!(authentify.username_exists(String::from("alice")));
            assert!(!authentify.username_exists(String::from("bob")));
        }

        #[ink::test]
        fn empty_username_registration() {
            let mut authentify = Authentify::new();
            let accounts = default_accounts();
            
            set_caller(accounts.alice);
            
            // Test empty string registration
            let result = authentify.register(String::from(""));
            assert!(result.is_ok()); // Empty string is allowed
            assert_eq!(authentify.get_total_users(), 1);
            assert!(authentify.username_exists(String::from("")));
        }

        #[ink::test]
        fn long_username_registration() {
            let mut authentify = Authentify::new();
            let accounts = default_accounts();
            
            set_caller(accounts.alice);
            
            // Test very long username
            let long_username = "a".repeat(1000);
            let result = authentify.register(long_username.clone());
            assert!(result.is_ok());
            assert_eq!(authentify.get_total_users(), 1);
            assert!(authentify.username_exists(long_username.clone()));
            assert_eq!(authentify.get_user(long_username).unwrap(), accounts.alice);
        }

        #[ink::test]
        fn special_characters_username() {
            let mut authentify = Authentify::new();
            let accounts = default_accounts();
            
            set_caller(accounts.alice);
            
            // Test username with special characters
            let special_username = String::from("alice@example.com_123-456");
            let result = authentify.register(special_username.clone());
            assert!(result.is_ok());
            assert_eq!(authentify.get_total_users(), 1);
            assert!(authentify.username_exists(special_username.clone()));
            assert_eq!(authentify.get_user(special_username).unwrap(), accounts.alice);
        }

        #[ink::test]
        fn unicode_username() {
            let mut authentify = Authentify::new();
            let accounts = default_accounts();
            
            set_caller(accounts.alice);
            
            // Test username with unicode characters
            let unicode_username = String::from("アリス🚀💻");
            let result = authentify.register(unicode_username.clone());
            assert!(result.is_ok());
            assert_eq!(authentify.get_total_users(), 1);
            assert!(authentify.username_exists(unicode_username.clone()));
            assert_eq!(authentify.get_user(unicode_username).unwrap(), accounts.alice);
        }

        #[ink::test]
        fn case_sensitive_usernames() {
            let mut authentify = Authentify::new();
            let accounts = default_accounts();
            
            set_caller(accounts.alice);
            
            // Register "Alice"
            let result1 = authentify.register(String::from("Alice"));
            assert!(result1.is_ok());
            
            // Register "alice" (different case)
            let result2 = authentify.register(String::from("alice"));
            assert!(result2.is_ok());
            
            // Both should exist
            assert_eq!(authentify.get_total_users(), 2);
            assert!(authentify.username_exists(String::from("Alice")));
            assert!(authentify.username_exists(String::from("alice")));
            assert!(!authentify.username_exists(String::from("ALICE")));
        }

        #[ink::test]
        fn admin_verification() {
            let accounts = default_accounts();
            
            // Set alice as caller when creating contract
            set_caller(accounts.alice);
            let authentify = Authentify::new();
            
            // Admin should be alice
            assert_eq!(authentify.get_admin(), accounts.alice);
            
            // Set bob as caller when creating another contract
            set_caller(accounts.bob);
            let authentify2 = Authentify::new();
            
            // Admin should be bob for the second contract
            assert_eq!(authentify2.get_admin(), accounts.bob);
        }

        #[ink::test]
        fn total_users_counter() {
            let mut authentify = Authentify::new();
            let accounts = default_accounts();
            
            // Initially 0 users
            assert_eq!(authentify.get_total_users(), 0);
            
            // Register users one by one and check counter
            set_caller(accounts.alice);
            let _ = authentify.register(String::from("alice"));
            assert_eq!(authentify.get_total_users(), 1);
            
            set_caller(accounts.bob);
            let _ = authentify.register(String::from("bob"));
            assert_eq!(authentify.get_total_users(), 2);
            
            set_caller(accounts.charlie);
            let _ = authentify.register(String::from("charlie"));
            assert_eq!(authentify.get_total_users(), 3);
            
            // Try to register duplicate - counter should not increase
            set_caller(accounts.alice);
            let result = authentify.register(String::from("alice"));
            assert_eq!(result, Err(Error::UsernameExists));
            assert_eq!(authentify.get_total_users(), 3); // Should remain 3
        }
    }
}