import * as forge from 'node-forge';

export interface KeyPair {
  publicKey: string;
  privateKey: string;
}

export async function generateKeyPair(): Promise<KeyPair> {
  return new Promise((resolve, reject) => {
    try {
      // Generate RSA key pair
      const keypair = forge.pki.rsa.generateKeyPair({ bits: 2048 });
      
      // Convert to PEM format
      const publicKey = forge.pki.publicKeyToPem(keypair.publicKey);
      const privateKey = forge.pki.privateKeyToPem(keypair.privateKey);
      
      resolve({ publicKey, privateKey });
    } catch (error) {
      reject(error);
    }
  });
}

export async function signData(data: string, privateKey: string): Promise<string> {
  try {
    const privateKeyObj = forge.pki.privateKeyFromPem(privateKey);
    const md = forge.md.sha256.create();
    md.update(data, 'utf8');
    const signature = privateKeyObj.sign(md);
    return forge.util.encode64(signature);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    throw new Error(`Failed to sign data: ${errorMessage}`);
  }
}

export async function verifySignature(data: string, signature: string, publicKey: string): Promise<boolean> {
  try {
    const publicKeyObj = forge.pki.publicKeyFromPem(publicKey);
    const md = forge.md.sha256.create();
    md.update(data, 'utf8');
    const signatureBytes = forge.util.decode64(signature);
    return publicKeyObj.verify(md.digest().bytes(), signatureBytes);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    throw new Error(`Failed to verify signature: ${errorMessage}`);
  }
} 