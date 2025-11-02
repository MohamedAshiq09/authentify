export interface Session {
  id: string;
  user_id: string;
  session_token: string;
  refresh_token: string;
  expires_at: string;
  created_at: string;
}

export interface TokenPayload {
  userId: string;
  email: string;
  walletAddress?: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}