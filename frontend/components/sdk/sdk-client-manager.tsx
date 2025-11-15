'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Plus, 
  Copy, 
  Eye, 
  EyeOff, 
  Trash2, 
  RefreshCw, 
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Key,
  Globe,
  Calendar,
  Code
} from 'lucide-react';

interface SDKClient {
  id: string;
  client_id: string;
  app_name: string;
  app_url?: string;
  redirect_uris: string[];
  created_at: string;
}

interface SDKClientManagerProps {
  token: string;
}

export function SDKClientManager({ token }: SDKClientManagerProps) {
  const [clients, setClients] = useState<SDKClient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showSecret, setShowSecret] = useState<string | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [newSecret, setNewSecret] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    app_name: '',
    app_url: '',
    redirect_uris: ['http://localhost:3000/auth/callback']
  });

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/sdk-client/clients`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error('Failed to load SDK clients');
      }

      const data = await response.json();
      setClients(data.data.clients || []);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const createClient = async () => {
    try {
      setError(null);
      
      // Debug logging
      console.log('Creating SDK client with token:', token ? 'Token exists' : 'No token');
      console.log('Form data:', formData);
      console.log('API URL:', `${API_URL}/sdk-client/clients`);
      
      const response = await fetch(`${API_URL}/sdk-client/clients`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        console.log('SDK client creation failed:', response.status, response.statusText);
        const errorText = await response.text();
        console.log('Error response:', errorText);
        
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { message: errorText };
        }
        
        throw new Error(errorData.message || 'Failed to create SDK client');
      }

      const data = await response.json();
      
      // Show the client secret immediately
      setNewSecret(data.data.client_secret);
      setShowSecret(data.data.client_id);
      
      // Reset form and reload clients
      setFormData({
        app_name: '',
        app_url: '',
        redirect_uris: ['http://localhost:3000/auth/callback']
      });
      setShowCreateForm(false);
      await loadClients();

    } catch (error: any) {
      setError(error.message);
    }
  };

  const deleteClient = async (clientId: string) => {
    if (!confirm('Are you sure you want to delete this SDK client? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/sdk-client/clients/${clientId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error('Failed to delete SDK client');
      }

      await loadClients();
    } catch (error: any) {
      setError(error.message);
    }
  };

  const regenerateSecret = async (clientId: string) => {
    if (!confirm('Are you sure you want to regenerate the client secret? The old secret will stop working immediately.')) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/sdk-client/clients/${clientId}/regenerate-secret`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error('Failed to regenerate client secret');
      }

      const data = await response.json();
      setNewSecret(data.data.client_secret);
      setShowSecret(clientId);
    } catch (error: any) {
      setError(error.message);
    }
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(type);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const addRedirectUri = () => {
    setFormData(prev => ({
      ...prev,
      redirect_uris: [...prev.redirect_uris, '']
    }));
  };

  const updateRedirectUri = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      redirect_uris: prev.redirect_uris.map((uri, i) => i === index ? value : uri)
    }));
  };

  const removeRedirectUri = (index: number) => {
    setFormData(prev => ({
      ...prev,
      redirect_uris: prev.redirect_uris.filter((_, i) => i !== index)
    }));
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-400 mx-auto mb-4"></div>
        <p className="text-gray-400">Loading SDK clients...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive" className="bg-red-900 border-red-800">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-red-200">{error}</AlertDescription>
        </Alert>
      )}

      {/* New Secret Display */}
      {newSecret && showSecret && (
        <Alert className="bg-green-900 border-green-800">
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription className="text-green-200">
            <div className="mb-2">
              <strong>Client Secret Generated!</strong> Save this secret securely - it won't be shown again.
            </div>
            <div className="flex items-center gap-2 bg-green-800/50 p-2 rounded font-mono text-sm">
              <code className="flex-1">{newSecret}</code>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => copyToClipboard(newSecret, 'secret')}
                className="text-green-200 hover:text-green-100"
              >
                {copiedText === 'secret' ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setNewSecret(null);
                setShowSecret(null);
              }}
              className="mt-2 text-green-200 hover:text-green-100"
            >
              Got it, hide this
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">SDK Clients</h2>
          <p className="text-gray-400 text-sm">
            Create and manage API credentials for your applications
          </p>
        </div>
        <Button
          onClick={() => setShowCreateForm(true)}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90"
        >
          <Plus className="mr-2 h-4 w-4" />
          Create Client
        </Button>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Create New SDK Client</CardTitle>
            <CardDescription className="text-gray-400">
              Generate API credentials for your application
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Application Name *
              </label>
              <Input
                value={formData.app_name}
                onChange={(e) => setFormData(prev => ({ ...prev, app_name: e.target.value }))}
                placeholder="My Awesome App"
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Application URL (optional)
              </label>
              <Input
                value={formData.app_url}
                onChange={(e) => setFormData(prev => ({ ...prev, app_url: e.target.value }))}
                placeholder="https://myapp.com"
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Redirect URIs *
              </label>
              {formData.redirect_uris.map((uri, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <Input
                    value={uri}
                    onChange={(e) => updateRedirectUri(index, e.target.value)}
                    placeholder="http://localhost:3000/auth/callback"
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                  {formData.redirect_uris.length > 1 && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeRedirectUri(index)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                size="sm"
                variant="ghost"
                onClick={addRedirectUri}
                className="text-purple-400 hover:text-purple-300"
              >
                <Plus className="mr-1 h-3 w-3" />
                Add URI
              </Button>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                onClick={createClient}
                disabled={!formData.app_name || formData.redirect_uris.some(uri => !uri)}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90"
              >
                Create Client
              </Button>
              <Button
                variant="ghost"
                onClick={() => setShowCreateForm(false)}
                className="text-gray-400 hover:text-white"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Clients List */}
      {clients.length === 0 ? (
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="text-center py-12">
            <div className="mx-auto mb-4 p-4 bg-gray-800 rounded-full w-fit">
              <Key className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              No SDK Clients Yet
            </h3>
            <p className="text-gray-400 mb-6 max-w-md mx-auto">
              Create your first SDK client to get API credentials for your application. 
              You'll receive a Client ID and Client Secret to integrate with the Authentify SDK.
            </p>
            <Button
              onClick={() => setShowCreateForm(true)}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Client
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {clients.map((client) => (
            <Card key={client.id} className="bg-gray-900 border-gray-800">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Globe className="h-5 w-5 text-purple-400" />
                      {client.app_name}
                    </CardTitle>
                    <CardDescription className="text-gray-400 mt-1">
                      {client.app_url && (
                        <a 
                          href={client.app_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-purple-400 hover:text-purple-300 flex items-center gap-1"
                        >
                          {client.app_url}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => regenerateSecret(client.client_id)}
                      className="text-yellow-400 hover:text-yellow-300"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteClient(client.client_id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Client ID */}
                <div>
                  <label className="block text-xs text-gray-400 mb-1">CLIENT ID</label>
                  <div className="flex items-center gap-2 bg-gray-800 p-3 rounded font-mono text-sm">
                    <code className="flex-1 text-white">{client.client_id}</code>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(client.client_id, `client-${client.id}`)}
                      className="text-gray-400 hover:text-white"
                    >
                      {copiedText === `client-${client.id}` ? 
                        <CheckCircle2 className="h-4 w-4" /> : 
                        <Copy className="h-4 w-4" />
                      }
                    </Button>
                  </div>
                </div>

                {/* Redirect URIs */}
                <div>
                  <label className="block text-xs text-gray-400 mb-1">REDIRECT URIS</label>
                  <div className="space-y-1">
                    {client.redirect_uris.map((uri, index) => (
                      <div key={index} className="bg-gray-800 p-2 rounded text-sm">
                        <code className="text-white">{uri}</code>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Created Date */}
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <Calendar className="h-3 w-3" />
                  Created {new Date(client.created_at).toLocaleDateString()}
                </div>

                {/* Usage Example */}
                <div className="bg-gray-800 p-3 rounded">
                  <div className="flex items-center gap-2 mb-2">
                    <Code className="h-4 w-4 text-purple-400" />
                    <span className="text-sm font-medium text-white">Usage Example</span>
                  </div>
                  <pre className="text-xs text-gray-300 overflow-x-auto">
{`import { AuthentifySDK } from 'authentify-sdk';

const sdk = new AuthentifySDK({
  clientId: '${client.client_id}',
  apiUrl: '${API_URL.replace('/api', '')}'
});`}
                  </pre>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}