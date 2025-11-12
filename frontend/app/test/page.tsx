'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function TestPage() {
  const { contractLogin, contractRegister, isLoading, error } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [result, setResult] = useState<any>(null);

  const handleLogin = async () => {
    try {
      const response = await contractLogin(formData.username, formData.password);
      setResult({ type: 'login', success: true, data: response });
    } catch (error: any) {
      setResult({ type: 'login', success: false, error: error.message });
    }
  };

  const handleRegister = async () => {
    try {
      const response = await contractRegister({
        username: formData.username,
        password: formData.password,
        walletAddress: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY', // Alice's address
        socialIdHash: `test_${Date.now()}`,
        socialProvider: 'test',
      });
      setResult({ type: 'register', success: true, data: response });
    } catch (error: any) {
      setResult({ type: 'register', success: false, error: error.message });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Authentify Test Page</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">Username</label>
              <Input
                type="text"
                placeholder="testuser"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Password</label>
              <Input
                type="password"
                placeholder="TestPassword123"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={handleRegister} 
                disabled={isLoading || !formData.username || !formData.password}
                className="flex-1"
              >
                Register
              </Button>
              <Button 
                onClick={handleLogin} 
                disabled={isLoading || !formData.username || !formData.password}
                variant="outline"
                className="flex-1"
              >
                Login
              </Button>
            </div>

            {result && (
              <div className="mt-4 p-4 bg-gray-100 rounded-lg">
                <h3 className="font-semibold mb-2">
                  {result.type === 'login' ? 'Login' : 'Register'} Result:
                </h3>
                {result.success ? (
                  <div className="text-green-600">
                    <p>✅ Success!</p>
                    <pre className="text-xs mt-2 overflow-auto">
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  </div>
                ) : (
                  <div className="text-red-600">
                    <p>❌ Error: {result.error}</p>
                  </div>
                )}
              </div>
            )}

            <div className="text-center text-sm text-gray-500">
              <p>This page tests the authentication system without blockchain features.</p>
              <p>Registration and login work through the backend API.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}