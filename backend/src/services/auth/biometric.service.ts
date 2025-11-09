import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from '@simplewebauthn/server';
import type {
  GenerateRegistrationOptionsOpts,
  GenerateAuthenticationOptionsOpts,
  VerifyRegistrationResponseOpts,
  VerifyAuthenticationResponseOpts,
} from '@simplewebauthn/server';
import { supabaseAdmin as supabase } from '../../config/supabase.config';
import { BiometricCredential } from '../../types/biometric.types';

const RP_NAME = process.env.RP_NAME || 'Authentify';
const RP_ID = process.env.RP_ID || 'localhost';
const ORIGIN = process.env.FRONTEND_URL || 'http://localhost:3000';

// In-memory challenge storage (use Redis in production)
const challengeStore = new Map<string, string>();

// Enhanced logging utility
class BiometricLogger {
  static log(level: 'info' | 'warn' | 'error', message: string, data?: any) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [BIOMETRIC-${level.toUpperCase()}] ${message}`;
    
    if (data) {
      console.log(logMessage, data);
    } else {
      console.log(logMessage);
    }
  }

  static info(message: string, data?: any) {
    this.log('info', message, data);
  }

  static warn(message: string, data?: any) {
    this.log('warn', message, data);
  }

  static error(message: string, data?: any) {
    this.log('error', message, data);
  }
}

export class BiometricService {
  /**
   * Generate registration options for WebAuthn
   */
  static async generateRegistrationOptions(email: string, username: string, authenticatorType: 'platform' | 'cross-platform' = 'platform') {
    try {
      BiometricLogger.info('Generating registration options', { email, username, authenticatorType });

      // Get user from database
      let { data: user, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single();

      if (userError || !user) {
        BiometricLogger.warn('User not found, creating temporary user for biometric registration', { email, error: userError });
        
        // For biometric registration, we can create a temporary user entry
        // This allows biometric registration to work even if the user hasn't completed full registration
        const { data: newUser, error: createError } = await supabase
          .from('users')
          .insert({
            email,
            password_hash: null, // No password for biometric-only users
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select('id')
          .single();

        if (createError || !newUser) {
          BiometricLogger.error('Failed to create user for biometric registration', { email, error: createError });
          throw new Error('Failed to create user for biometric registration');
        }

        user = newUser;
        BiometricLogger.info('Created temporary user for biometric registration', { email, userId: user.id });
      }

      // Get existing credentials
      const { data: existingCredentials } = await supabase
        .from('biometric_credentials')
        .select('credential_id')
        .eq('user_id', user.id);

      BiometricLogger.info('Found existing credentials', { 
        userId: user.id, 
        credentialCount: existingCredentials?.length || 0 
      });

      const opts: GenerateRegistrationOptionsOpts = {
        rpName: RP_NAME,
        rpID: RP_ID,
        userID: Buffer.from(user.id, 'utf-8'),
        userName: username,
        userDisplayName: username,
        attestationType: 'none',
        authenticatorSelection: {
          authenticatorAttachment: authenticatorType,
          userVerification: 'required',
          residentKey: authenticatorType === 'platform' ? 'preferred' : 'required',
        },
        excludeCredentials: (existingCredentials || []).map((cred: any) => ({
          id: cred.credential_id,
          type: 'public-key' as const,
        })),
        supportedAlgorithmIDs: [-7, -257], // ES256 and RS256
      };

      const options = await generateRegistrationOptions(opts);

      // Store challenge temporarily
      challengeStore.set(email, options.challenge);

      BiometricLogger.info('Registration options generated successfully', {
        email,
        challengeLength: options.challenge.length,
        excludedCredentials: existingCredentials?.length || 0
      });

      return options;
    } catch (error: any) {
      BiometricLogger.error('Error generating registration options', { email, error: error.message });
      throw new Error(error.message || 'Failed to generate registration options');
    }
  }

  /**
   * Verify registration response and store credential
   */
  static async verifyRegistration(email: string, attestationResponse: any) {
    try {
      BiometricLogger.info('Starting registration verification', { email });

      // Get stored challenge
      const expectedChallenge = challengeStore.get(email);
      if (!expectedChallenge) {
        BiometricLogger.error('Challenge not found or expired', { email });
        throw new Error('Challenge not found or expired');
      }

      // Get user
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single();

      if (userError || !user) {
        BiometricLogger.error('User not found during verification', { email, error: userError });
        throw new Error('User not found');
      }

      // Enhanced logging for attestation response
      BiometricLogger.info('Attestation response details', {
        email,
        credentialId: attestationResponse.id,
        credentialIdType: typeof attestationResponse.id,
        credentialIdLength: attestationResponse.id?.length,
        responseType: attestationResponse.type,
        hasRawId: !!attestationResponse.rawId,
        hasClientDataJSON: !!attestationResponse.response?.clientDataJSON,
        hasAttestationObject: !!attestationResponse.response?.attestationObject
      });

      // Validate credential ID format
      const isBase64Url = (str: string): boolean => {
        return /^[A-Za-z0-9_-]+$/.test(str);
      };

      if (!attestationResponse.id || !isBase64Url(attestationResponse.id)) {
        BiometricLogger.error('Invalid credential ID format', { 
          email, 
          credentialId: attestationResponse.id,
          isString: typeof attestationResponse.id === 'string',
          passesRegex: attestationResponse.id ? isBase64Url(attestationResponse.id) : false
        });
        throw new Error('Credential ID is not properly base64url encoded');
      }

      const opts: VerifyRegistrationResponseOpts = {
        response: attestationResponse,
        expectedChallenge,
        expectedOrigin: ORIGIN,
        expectedRPID: RP_ID,
      };

      BiometricLogger.info('Verifying registration with options', {
        email,
        expectedOrigin: ORIGIN,
        expectedRPID: RP_ID,
        challengeLength: expectedChallenge.length
      });

      const verification = await verifyRegistrationResponse(opts);

      BiometricLogger.info('Registration verification result', {
        email,
        verified: verification.verified,
        hasRegistrationInfo: !!verification.registrationInfo
      });

      if (verification.verified && verification.registrationInfo) {
        const { credential } = verification.registrationInfo;

        // Ensure credential ID is base64url encoded string
        const credentialId = typeof credential.id === 'string' 
          ? credential.id 
          : Buffer.from(credential.id).toString('base64url');

        BiometricLogger.info('Storing credential in database', {
          email,
          userId: user.id,
          credentialId,
          counter: credential.counter,
          publicKeyLength: credential.publicKey.byteLength
        });

        // Store credential in database
        const { data: storedCredential, error: storeError } = await supabase
          .from('biometric_credentials')
          .insert({
            user_id: user.id,
            credential_id: credentialId,
            credential_public_key: Buffer.from(credential.publicKey).toString('base64url'),
            counter: credential.counter,
          })
          .select()
          .single();

        if (storeError) {
          BiometricLogger.error('Failed to store credential in database', { 
            email, 
            error: storeError 
          });
          throw new Error('Failed to store credential');
        }

        // Clear challenge
        challengeStore.delete(email);

        BiometricLogger.info('Registration completed successfully', {
          email,
          credentialId: storedCredential.id
        });

        return {
          verified: true,
          credential: storedCredential,
        };
      }

      BiometricLogger.warn('Registration verification failed', { email });
      return { verified: false };
    } catch (error: any) {
      BiometricLogger.error('Error verifying registration', { email, error: error.message, stack: error.stack });
      throw new Error(error.message || 'Failed to verify registration');
    }
  }

  /**
   * Generate authentication options
   */
  static async generateAuthenticationOptions(email: string) {
    try {
      // Get user
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single();

      if (userError || !user) {
        throw new Error('User not found');
      }

      // Get user's credentials
      const { data: credentials, error: credError } = await supabase
        .from('biometric_credentials')
        .select('credential_id')
        .eq('user_id', user.id);

      if (credError || !credentials || credentials.length === 0) {
        throw new Error('No biometric credentials registered');
      }

      const opts: GenerateAuthenticationOptionsOpts = {
        rpID: RP_ID,
        allowCredentials: credentials.map((cred: any) => ({
          id: cred.credential_id,
          type: 'public-key' as const,
          transports: ['internal' as const],
        })),
        userVerification: 'required',
      };

      const options = await generateAuthenticationOptions(opts);

      // Store challenge
      challengeStore.set(email, options.challenge);

      return options;
    } catch (error: any) {
      console.error('Error generating authentication options:', error);
      throw new Error(error.message || 'Failed to generate authentication options');
    }
  }

  /**
   * Verify authentication response
   */
  static async verifyAuthentication(email: string, assertionResponse: any) {
    try {
      // Get stored challenge
      const expectedChallenge = challengeStore.get(email);
      if (!expectedChallenge) {
        throw new Error('Challenge not found or expired');
      }

      // Get user
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single();

      if (userError || !user) {
        throw new Error('User not found');
      }

      // Get credential from database
      const { data: dbCredential, error: credError } = await supabase
        .from('biometric_credentials')
        .select('*')
        .eq('user_id', user.id)
        .eq('credential_id', assertionResponse.id)
        .single();

      if (credError || !dbCredential) {
        throw new Error('Credential not found');
      }

      const opts: VerifyAuthenticationResponseOpts = {
        response: assertionResponse,
        expectedChallenge,
        expectedOrigin: ORIGIN,
        expectedRPID: RP_ID,
        credential: {
          id: dbCredential.credential_id,
          publicKey: Buffer.from(dbCredential.credential_public_key, 'base64url'),
          counter: dbCredential.counter,
        },
      };

      const verification = await verifyAuthenticationResponse(opts);

      if (verification.verified && verification.authenticationInfo) {
        // Update counter and last used
        await supabase
          .from('biometric_credentials')
          .update({
            counter: verification.authenticationInfo.newCounter,
            last_used: new Date().toISOString(),
          })
          .eq('id', dbCredential.id);

        // Clear challenge
        challengeStore.delete(email);

        return {
          verified: true,
          user,
        };
      }

      return { verified: false };
    } catch (error: any) {
      console.error('Error verifying authentication:', error);
      throw new Error(error.message || 'Failed to verify authentication');
    }
  }

  /**
   * Get user's biometric credentials
   */
  static async getUserCredentials(userId: string): Promise<BiometricCredential[]> {
    const { data, error } = await supabase
      .from('biometric_credentials')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error('Failed to fetch credentials');
    }

    return data || [];
  }

  /**
   * Delete a biometric credential
   */
  static async deleteCredential(userId: string, credentialId: string) {
    const { error } = await supabase
      .from('biometric_credentials')
      .delete()
      .eq('user_id', userId)
      .eq('credential_id', credentialId);

    if (error) {
      throw new Error('Failed to delete credential');
    }

    return { success: true };
  }
}
