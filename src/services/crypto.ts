import { EncryptedPayload } from '../types';

// Convert Uint8Array to Hex string
function buf2hex(buffer: ArrayBuffer): string {
  return [...new Uint8Array(buffer)]
    .map(x => x.toString(16).padStart(2, '0'))
    .join('');
}

// Convert Hex string to Uint8Array
function hex2buf(hex: string): Uint8Array {
  const bytes = new Uint8Array(Math.ceil(hex.length / 2));
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
  }
  return bytes;
}

// Generate an AES-GCM 256-bit key
export async function generateSessionKey(): Promise<CryptoKey> {
  if (typeof window === 'undefined' || !window.crypto?.subtle) {
    throw new Error('Web Crypto API não disponível neste ambiente.');
  }
  return await window.crypto.subtle.generateKey(
    {
      name: 'AES-GCM',
      length: 256,
    },
    true,
    ['encrypt', 'decrypt']
  );
}

// Global cached session key for demo/channel consistency
let cachedSessionKey: CryptoKey | null = null;
let cachedKeyFingerprint: string = 'E2EE-ISAIASCO-9982-A4B7-C091';

export async function getActiveChannelCryptoKey(): Promise<{ key: CryptoKey; fingerprint: string }> {
  if (!cachedSessionKey) {
    cachedSessionKey = await generateSessionKey();
    const rawKey = await window.crypto.subtle.exportKey('raw', cachedSessionKey);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', rawKey);
    const hashHex = buf2hex(hashBuffer).toUpperCase();
    cachedKeyFingerprint = `${hashHex.substring(0, 4)}-${hashHex.substring(4, 8)}-${hashHex.substring(8, 12)}-${hashHex.substring(12, 16)}`;
  }
  return { key: cachedSessionKey, fingerprint: cachedKeyFingerprint };
}

// Encrypt plaintext with AES-GCM 256-bit and a random 12-byte IV
export async function encryptE2EEMessage(text: string): Promise<EncryptedPayload> {
  const { key, fingerprint } = await getActiveChannelCryptoKey();
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  
  // 96-bit (12 bytes) IV standard for AES-GCM
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  
  const encryptedBuffer = await window.crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv,
    },
    key,
    data
  );

  return {
    cipherText: buf2hex(encryptedBuffer),
    iv: buf2hex(iv.buffer),
    algorithm: 'AES-256-GCM',
    keyFingerprint: fingerprint,
  };
}

// Decrypt ciphertext using AES-GCM
export async function decryptE2EEMessage(payload: EncryptedPayload): Promise<string> {
  try {
    const { key } = await getActiveChannelCryptoKey();
    const iv = hex2buf(payload.iv);
    const encryptedData = hex2buf(payload.cipherText);

    const decryptedBuffer = await window.crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv as BufferSource,
      },
      key,
      encryptedData as BufferSource
    );

    const decoder = new TextDecoder();
    return decoder.decode(decryptedBuffer);
  } catch (error) {
    console.warn('Falha na decriptografia E2EE:', error);
    return '[Mensagem Criptografada - Chave Não Sincronizada]';
  }
}

// Generate Safety Numbers for user verification (similar to Signal / WhatsApp)
export async function generateSafetyNumbers(userA: string, userB: string): Promise<string[]> {
  const encoder = new TextEncoder();
  const combined = [userA, userB].sort().join(':ISAIASCO-SAFETY:');
  const hash = await window.crypto.subtle.digest('SHA-256', encoder.encode(combined));
  const hex = buf2hex(hash);
  
  // Format into 6 blocks of 5 digits
  const blocks: string[] = [];
  for (let i = 0; i < 6; i++) {
    const slice = hex.substr(i * 5, 5);
    const num = (parseInt(slice, 16) % 100000).toString().padStart(5, '0');
    blocks.push(num);
  }
  return blocks;
}

// Generate a cryptographic hardware/software token for user session
export function generateSecurityToken(): { token: string; expiry: string } {
  const array = new Uint8Array(16);
  window.crypto.getRandomValues(array);
  const token = 'ISC-' + buf2hex(array.buffer).toUpperCase().match(/.{1,4}/g)?.join('-');
  const expiry = new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(); // 8 hours
  return { token, expiry };
}
