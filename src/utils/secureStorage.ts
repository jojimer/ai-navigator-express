import { signData } from './keyPair';

// Encryption key for storing private key
const ENCRYPTION_KEY = 'your-encryption-key'; // Replace with a secure key

export class SecureStorage {
  private static instance: SecureStorage;
  private privateKey: string | null = null;

  private constructor() {}

  static getInstance(): SecureStorage {
    if (!SecureStorage.instance) {
      SecureStorage.instance = new SecureStorage();
    }
    return SecureStorage.instance;
  }

  // Store private key securely
  async storePrivateKey(privateKey: string): Promise<void> {
    try {
      // Encrypt the private key before storing
      const encryptedKey = await this.encrypt(privateKey);
      await chrome.storage.local.set({ 'encryptedPrivateKey': encryptedKey });
      this.privateKey = privateKey;
    } catch (error) {
      console.error('Error storing private key:', error);
      throw new Error('Failed to store private key');
    }
  }

  // Get private key
  async getPrivateKey(): Promise<string> {
    try {
      if (this.privateKey) {
        return this.privateKey;
      }

      const result = await chrome.storage.local.get('encryptedPrivateKey');
      if (!result.encryptedPrivateKey) {
        throw new Error('No private key found');
      }

      // Decrypt the private key
      const decryptedKey = await this.decrypt(result.encryptedPrivateKey);
      this.privateKey = decryptedKey;
      return decryptedKey;
    } catch (error) {
      console.error('Error retrieving private key:', error);
      throw new Error('Failed to retrieve private key');
    }
  }

  // Sign a request
  async signRequest(extensionId: string, body: any): Promise<{
    headers: {
      'x-extension-id': string;
      'x-timestamp': string;
      'x-signature': string;
    };
  }> {
    try {
      const timestamp = Date.now().toString();
      const dataToSign = `${extensionId}:${timestamp}:${JSON.stringify(body)}`;
      const privateKey = await this.getPrivateKey();
      const signature = await signData(dataToSign, privateKey);

      return {
        headers: {
          'x-extension-id': extensionId,
          'x-timestamp': timestamp,
          'x-signature': signature
        }
      };
    } catch (error) {
      console.error('Error signing request:', error);
      throw new Error('Failed to sign request');
    }
  }

  // Simple encryption (replace with a more secure method in production)
  private async encrypt(data: string): Promise<string> {
    // This is a placeholder. In production, use a proper encryption library
    return btoa(data);
  }

  // Simple decryption (replace with a more secure method in production)
  private async decrypt(data: string): Promise<string> {
    // This is a placeholder. In production, use a proper encryption library
    return atob(data);
  }

  // Clear stored keys
  async clearKeys(): Promise<void> {
    try {
      await chrome.storage.local.remove('encryptedPrivateKey');
      this.privateKey = null;
    } catch (error) {
      console.error('Error clearing keys:', error);
      throw new Error('Failed to clear keys');
    }
  }
} 