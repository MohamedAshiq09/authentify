#[cfg(test)]
#[cfg(feature = "e2e-tests")]
mod e2e_tests {
    use super::*;
    use ink_e2e::build_message;

    type E2EResult<T> = std::result::Result<T, Box<dyn std::error::Error>>;

    #[ink_e2e::test]
    async fn test_e2e_registration(mut client: ink_e2e::Client<C, E>) -> E2EResult<()> {
        // Deploy contract
        let constructor = AuthentifyRef::new();
        let contract_account_id = client
            .instantiate("authentify", &ink_e2e::alice(), constructor, 0, None)
            .await
            .expect("instantiate failed")
            .account_id;

        // Register identity
        let register = build_message::<AuthentifyRef>(contract_account_id.clone())
            .call(|authentify| {
                authentify.register_identity(
                    String::from("alice"),
                    String::from("$2a$10$test_hash"),
                    String::from("social_hash"),
                    String::from("google"),
                )
            });

        let result = client
            .call(&ink_e2e::alice(), register, 0, None)
            .await
            .expect("register_identity failed");

        assert!(result.is_ok());

        Ok(())
    }
}