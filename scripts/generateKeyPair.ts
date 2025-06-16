import { generateKeyPair } from '../src/utils/keyPair';
import * as fs from 'fs';
import * as path from 'path';

async function generateAndSaveKeyPair() {
  try {
    // Generate the key pair
    const { publicKey, privateKey } = await generateKeyPair();

    // Create keys directory if it doesn't exist
    const keysDir = path.join(__dirname, '../keys');
    if (!fs.existsSync(keysDir)) {
      fs.mkdirSync(keysDir);
    }

    // Save the keys to files
    fs.writeFileSync(path.join(keysDir, 'public.pem'), publicKey);
    fs.writeFileSync(path.join(keysDir, 'private.pem'), privateKey);

    console.log('Key pair generated successfully!');
    console.log('Public key saved to: keys/public.pem');
    console.log('Private key saved to: keys/private.pem');
    
    // Also output the keys to console for easy copying
    console.log('\nPublic Key:');
    console.log(publicKey);
    console.log('\nPrivate Key:');
    console.log(privateKey);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Error generating key pair:', errorMessage);
    process.exit(1);
  }
}

generateAndSaveKeyPair(); 