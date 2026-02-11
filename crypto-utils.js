// ==========================================
// CRYPTOGRAPHIC UTILITIES MODULE
// Handles document hashing, key generation, and digital signatures
// ==========================================

class CryptoUtils {
    constructor() {
        // Check if Web Crypto API is available
        if (!window.crypto || !window.crypto.subtle) {
            console.error('Web Crypto API not available!');
            throw new Error('Browser does not support Web Crypto API');
        }
        this.crypto = window.crypto;
    }

    // ==========================================
    // DOCUMENT HASHING (SHA-256)
    // ==========================================

    /**
     * Generate SHA-256 hash of a document
     * @param {File|Blob|ArrayBuffer|string} data - Document data to hash
     * @returns {Promise<string>} - Hex string of the hash
     */
    async hashDocument(data) {
        try {
            let buffer;

            // Convert different input types to ArrayBuffer
            if (data instanceof File || data instanceof Blob) {
                buffer = await data.arrayBuffer();
            } else if (data instanceof ArrayBuffer) {
                buffer = data;
            } else if (typeof data === 'string') {
                // If it's a base64 data URL, extract the base64 part
                if (data.startsWith('data:')) {
                    const base64 = data.split(',')[1];
                    buffer = this.base64ToArrayBuffer(base64);
                } else {
                    // Plain string
                    const encoder = new TextEncoder();
                    buffer = encoder.encode(data);
                }
            } else {
                throw new Error('Unsupported data type for hashing');
            }

            // Generate SHA-256 hash
            const hashBuffer = await this.crypto.subtle.digest('SHA-256', buffer);
            
            // Convert to hex string
            return this.arrayBufferToHex(hashBuffer);
        } catch (error) {
            console.error('Error hashing document:', error);
            throw error;
        }
    }

    /**
     * Verify document hash matches expected hash
     * @param {File|Blob|ArrayBuffer|string} data - Document data
     * @param {string} expectedHash - Expected hash in hex format
     * @returns {Promise<boolean>} - True if hashes match
     */
    async verifyDocumentHash(data, expectedHash) {
        try {
            const actualHash = await this.hashDocument(data);
            return actualHash === expectedHash;
        } catch (error) {
            console.error('Error verifying document hash:', error);
            throw error;
        }
    }

    // ==========================================
    // RSA KEY PAIR GENERATION
    // ==========================================

    /**
     * Generate RSA key pair for digital signatures
     * @param {number} keySize - Key size in bits (2048 or 4096)
     * @returns {Promise<{publicKey: CryptoKey, privateKey: CryptoKey}>}
     */
    async generateKeyPair(keySize = 2048) {
        try {
            const keyPair = await this.crypto.subtle.generateKey(
                {
                    name: 'RSASSA-PKCS1-v1_5',
                    modulusLength: keySize,
                    publicExponent: new Uint8Array([1, 0, 1]), // 65537
                    hash: 'SHA-256'
                },
                true, // extractable
                ['sign', 'verify']
            );

            return keyPair;
        } catch (error) {
            console.error('Error generating key pair:', error);
            throw error;
        }
    }

    /**
     * Export public key to PEM format
     * @param {CryptoKey} publicKey
     * @returns {Promise<string>} - PEM formatted public key
     */
    async exportPublicKey(publicKey) {
        try {
            const exported = await this.crypto.subtle.exportKey('spki', publicKey);
            const exportedAsBase64 = this.arrayBufferToBase64(exported);
            
            const pemHeader = '-----BEGIN PUBLIC KEY-----\n';
            const pemFooter = '\n-----END PUBLIC KEY-----';
            const pemBody = this.formatPEM(exportedAsBase64);
            
            return pemHeader + pemBody + pemFooter;
        } catch (error) {
            console.error('Error exporting public key:', error);
            throw error;
        }
    }

    /**
     * Export private key to PEM format
     * @param {CryptoKey} privateKey
     * @returns {Promise<string>} - PEM formatted private key
     */
    async exportPrivateKey(privateKey) {
        try {
            const exported = await this.crypto.subtle.exportKey('pkcs8', privateKey);
            const exportedAsBase64 = this.arrayBufferToBase64(exported);
            
            const pemHeader = '-----BEGIN PRIVATE KEY-----\n';
            const pemFooter = '\n-----END PRIVATE KEY-----';
            const pemBody = this.formatPEM(exportedAsBase64);
            
            return pemHeader + pemBody + pemFooter;
        } catch (error) {
            console.error('Error exporting private key:', error);
            throw error;
        }
    }

    /**
     * Import public key from PEM format
     * @param {string} pem - PEM formatted public key
     * @returns {Promise<CryptoKey>}
     */
    async importPublicKey(pem) {
        try {
            // Remove PEM headers and newlines
            const pemContents = pem
                .replace('-----BEGIN PUBLIC KEY-----', '')
                .replace('-----END PUBLIC KEY-----', '')
                .replace(/\s/g, '');
            
            const binaryDer = this.base64ToArrayBuffer(pemContents);
            
            return await this.crypto.subtle.importKey(
                'spki',
                binaryDer,
                {
                    name: 'RSASSA-PKCS1-v1_5',
                    hash: 'SHA-256'
                },
                true,
                ['verify']
            );
        } catch (error) {
            console.error('Error importing public key:', error);
            throw error;
        }
    }

    /**
     * Import private key from PEM format
     * @param {string} pem - PEM formatted private key
     * @returns {Promise<CryptoKey>}
     */
    async importPrivateKey(pem) {
        try {
            // Remove PEM headers and newlines
            const pemContents = pem
                .replace('-----BEGIN PRIVATE KEY-----', '')
                .replace('-----END PRIVATE KEY-----', '')
                .replace(/\s/g, '');
            
            const binaryDer = this.base64ToArrayBuffer(pemContents);
            
            return await this.crypto.subtle.importKey(
                'pkcs8',
                binaryDer,
                {
                    name: 'RSASSA-PKCS1-v1_5',
                    hash: 'SHA-256'
                },
                true,
                ['sign']
            );
        } catch (error) {
            console.error('Error importing private key:', error);
            throw error;
        }
    }

    // ==========================================
    // DIGITAL SIGNATURE OPERATIONS
    // ==========================================

    /**
     * Sign document hash with private key
     * @param {string} documentHash - Hex string hash of document
     * @param {CryptoKey|string} privateKey - CryptoKey or PEM string
     * @returns {Promise<string>} - Base64 encoded signature
     */
    async signHash(documentHash, privateKey) {
        try {
            // Import private key if it's a PEM string
            let key = privateKey;
            if (typeof privateKey === 'string') {
                key = await this.importPrivateKey(privateKey);
            }

            // Convert hex hash to ArrayBuffer
            const hashBuffer = this.hexToArrayBuffer(documentHash);

            // Sign the hash
            const signature = await this.crypto.subtle.sign(
                'RSASSA-PKCS1-v1_5',
                key,
                hashBuffer
            );

            // Return as base64
            return this.arrayBufferToBase64(signature);
        } catch (error) {
            console.error('Error signing hash:', error);
            throw error;
        }
    }

    /**
     * Verify signature using public key
     * @param {string} documentHash - Hex string hash of document
     * @param {string} signatureBase64 - Base64 encoded signature
     * @param {CryptoKey|string} publicKey - CryptoKey or PEM string
     * @returns {Promise<boolean>} - True if signature is valid
     */
    async verifySignature(documentHash, signatureBase64, publicKey) {
        try {
            // Import public key if it's a PEM string
            let key = publicKey;
            if (typeof publicKey === 'string') {
                key = await this.importPublicKey(publicKey);
            }

            // Convert hex hash to ArrayBuffer
            const hashBuffer = this.hexToArrayBuffer(documentHash);

            // Convert base64 signature to ArrayBuffer
            const signatureBuffer = this.base64ToArrayBuffer(signatureBase64);

            // Verify the signature
            return await this.crypto.subtle.verify(
                'RSASSA-PKCS1-v1_5',
                key,
                signatureBuffer,
                hashBuffer
            );
        } catch (error) {
            console.error('Error verifying signature:', error);
            throw error;
        }
    }

    // ==========================================
    // UTILITY FUNCTIONS
    // ==========================================

    /**
     * Convert ArrayBuffer to hex string
     */
    arrayBufferToHex(buffer) {
        const byteArray = new Uint8Array(buffer);
        return Array.from(byteArray)
            .map(byte => byte.toString(16).padStart(2, '0'))
            .join('');
    }

    /**
     * Convert hex string to ArrayBuffer
     */
    hexToArrayBuffer(hex) {
        const bytes = new Uint8Array(hex.length / 2);
        for (let i = 0; i < hex.length; i += 2) {
            bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
        }
        return bytes.buffer;
    }

    /**
     * Convert ArrayBuffer to base64 string
     */
    arrayBufferToBase64(buffer) {
        const bytes = new Uint8Array(buffer);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return window.btoa(binary);
    }

    /**
     * Convert base64 string to ArrayBuffer
     */
    base64ToArrayBuffer(base64) {
        const binary = window.atob(base64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
        }
        return bytes.buffer;
    }

    /**
     * Format base64 string into PEM format (64 chars per line)
     */
    formatPEM(base64) {
        const lineLength = 64;
        let formatted = '';
        for (let i = 0; i < base64.length; i += lineLength) {
            formatted += base64.substr(i, lineLength) + '\n';
        }
        return formatted.trim();
    }

    /**
     * Generate a fingerprint for a public key (SHA-256 of the key)
     */
    async generateKeyFingerprint(publicKeyPem) {
        try {
            const encoder = new TextEncoder();
            const data = encoder.encode(publicKeyPem);
            const hashBuffer = await this.crypto.subtle.digest('SHA-256', data);
            const hashHex = this.arrayBufferToHex(hashBuffer);
            
            // Format as XX:XX:XX:... (common fingerprint format)
            return hashHex.match(/.{2}/g).join(':').toUpperCase();
        } catch (error) {
            console.error('Error generating fingerprint:', error);
            throw error;
        }
    }

    /**
     * Get current timestamp in ISO format
     */
    getTimestamp() {
        return new Date().toISOString();
    }
}

// Create global instance
const cryptoUtils = new CryptoUtils();

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CryptoUtils;
}