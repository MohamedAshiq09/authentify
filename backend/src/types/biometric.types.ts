export interface BiometricCredential {
  id: string;
  user_id: string;
  credential_id: string;
  credential_public_key: string;
  counter: number;
  created_at: string;
  last_used: string;
}

export interface BiometricRegistrationRequest {
  email: string;
  username: string;
  attestationResponse: any;
}

export interface BiometricAuthenticationRequest {
  email: string;
  assertionResponse: any;
}
