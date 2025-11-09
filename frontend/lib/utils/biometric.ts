/**
 * Biometric Authentication Utilities using WebAuthn API
 * Uses backend API for credential storage and verification
 */

import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

export interface BiometricCredential {
  id: string;
  user_id: string;
  credential_id: string;
  credential_public_key: string;
  counter: number;
  created_at: string;
  last_used: string;
}

/**
 * Get user's biometric credentials from backend
 */
export async function getStoredCredentials(token?: string): Promise<BiometricCredential[]> {
  if (!token) return [];
  
  try {
    const response = await axios.get(`${API_URL}/biometric/credentials`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.data.credentials || [];
  } catch (error) {
    console.error('Failed to load credentials:', error);
    return [];
  }
}

/**
 * Check if WebAuthn is supported
 */
export function isBiometricSupported(): boolean {
  return typeof window !== 'undefined' && 
         window.PublicKeyCredential !== undefined &&
         navigator.credentials !== undefined;
}

/**
 * Register a new biometric credential
 */
export async function registerBiometric(
  userEmail: string,
  userName: string,
  authenticatorType: 'platform' | 'cross-platform' = 'platform'
): Promise<BiometricCredential> {
  if (!isBiometricSupported()) {
    throw new Error('Biometric authentication is not supported on this device');
  }

  try {
    // Step 1: Get registration options from server
    const optionsResponse = await axios.post(`${API_URL}/biometric/registration/options`, {
      email: userEmail,
      username: userName,
      authenticatorType,
    });

    const options = optionsResponse.data.data;

    // Helper function to convert base64url to Uint8Array
    const base64UrlToUint8Array = (base64url: string): Uint8Array => {
      const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
      const padded = base64.padEnd(base64.length + (4 - base64.length % 4) % 4, '=');
      const binary = atob(padded);
      return Uint8Array.from(binary, c => c.charCodeAt(0));
    };

    // Step 2: Create credential with WebAuthn
    const credential = await navigator.credentials.create({
      publicKey: {
        ...options,
        challenge: base64UrlToUint8Array(options.challenge),
        user: {
          ...options.user,
          id: base64UrlToUint8Array(options.user.id),
        },
      },
    }) as PublicKeyCredential;

    if (!credential) {
      throw new Error('Failed to create credential');
    }

    // Step 3: Send attestation response to server for verification
    const response = credential.response as AuthenticatorAttestationResponse;
    
    // Helper function to convert ArrayBuffer to base64url
    const arrayBufferToBase64Url = (buffer: ArrayBuffer): string => {
      const bytes = new Uint8Array(buffer);
      let binary = '';
      for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
    };

    // The credential.id is already base64url encoded by the browser
    // We just need to ensure the binary data is properly encoded
    const attestationResponse = {
      id: credential.id, // Already base64url encoded
      rawId: arrayBufferToBase64Url(credential.rawId),
      response: {
        clientDataJSON: arrayBufferToBase64Url(response.clientDataJSON),
        attestationObject: arrayBufferToBase64Url(response.attestationObject),
      },
      type: credential.type,
    };

    console.log('Sending attestation response:', {
      id: attestationResponse.id,
      idType: typeof attestationResponse.id,
      idLength: attestationResponse.id.length,
    });

    const verifyResponse = await axios.post(`${API_URL}/biometric/registration/verify`, {
      email: userEmail,
      attestationResponse,
    });

    if (!verifyResponse.data.data.verified) {
      throw new Error('Registration verification failed');
    }

    return verifyResponse.data.data.credential;
  } catch (error: any) {
    console.error('Biometric registration failed:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to register biometric credential');
  }
}

/**
 * Authenticate using biometric
 */
export async function authenticateBiometric(
  userEmail: string
): Promise<{ user: any; accessToken: string; refreshToken: string }> {
  if (!isBiometricSupported()) {
    throw new Error('Biometric authentication is not supported on this device');
  }

  try {
    // Step 1: Get authentication options from server
    const optionsResponse = await axios.post(`${API_URL}/biometric/authentication/options`, {
      email: userEmail,
    });

    const options = optionsResponse.data.data;

    // Helper function to convert base64url to Uint8Array
    const base64UrlToUint8Array = (base64url: string): Uint8Array => {
      const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
      const padded = base64.padEnd(base64.length + (4 - base64.length % 4) % 4, '=');
      const binary = atob(padded);
      return Uint8Array.from(binary, c => c.charCodeAt(0));
    };

    // Step 2: Get credential with WebAuthn
    const assertion = await navigator.credentials.get({
      publicKey: {
        ...options,
        challenge: base64UrlToUint8Array(options.challenge),
        allowCredentials: options.allowCredentials.map((cred: any) => ({
          ...cred,
          id: base64UrlToUint8Array(cred.id),
        })),
      },
    }) as PublicKeyCredential;

    if (!assertion) {
      throw new Error('Authentication failed');
    }

    // Step 3: Send assertion response to server for verification
    const response = assertion.response as AuthenticatorAssertionResponse;
    
    // Helper function to convert ArrayBuffer to base64url
    const arrayBufferToBase64Url = (buffer: ArrayBuffer): string => {
      const bytes = new Uint8Array(buffer);
      let binary = '';
      for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
    };

    // The assertion.id is already base64url encoded by the browser
    const assertionResponse = {
      id: assertion.id, // Already base64url encoded
      rawId: arrayBufferToBase64Url(assertion.rawId),
      response: {
        clientDataJSON: arrayBufferToBase64Url(response.clientDataJSON),
        authenticatorData: arrayBufferToBase64Url(response.authenticatorData),
        signature: arrayBufferToBase64Url(response.signature),
        userHandle: response.userHandle ? arrayBufferToBase64Url(response.userHandle) : undefined,
      },
      type: assertion.type,
    };

    const verifyResponse = await axios.post(`${API_URL}/biometric/authentication/verify`, {
      email: userEmail,
      assertionResponse,
    });

    if (!verifyResponse.data.data.user) {
      throw new Error('Authentication verification failed');
    }

    return verifyResponse.data.data;
  } catch (error: any) {
    console.error('Biometric authentication failed:', error);
    throw new Error(error.response?.data?.message || error.message || 'Authentication failed');
  }
}

/**
 * Delete a biometric credential
 */
export async function deleteCredential(credentialId: string, token: string): Promise<void> {
  try {
    await axios.delete(`${API_URL}/biometric/credentials/${credentialId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch (error: any) {
    console.error('Failed to delete credential:', error);
    throw new Error(error.response?.data?.message || 'Failed to delete credential');
  }
}

/**
 * Check if user has registered biometric
 */
export async function hasRegisteredBiometric(userEmail: string, token?: string): Promise<boolean> {
  if (!token) return false;
  
  try {
    const credentials = await getStoredCredentials(token);
    return credentials.length > 0;
  } catch (error) {
    return false;
  }
}
