// ==========================================
// LOCAL STORAGE AUTHENTICATION SYSTEM
// Fixed version with better error handling
// ==========================================

class AuthManager {
    constructor() {
        this.USERS_KEY = 'securesign_users';
        this.SESSION_KEY = 'securesign_session';
        this.initializeDefaultUsers();
    }

    // Initialize with default admin and user accounts
    initializeDefaultUsers() {
        const existingUsers = this.getAllUsers();
        
        // Only add default users if no users exist
        if (Object.keys(existingUsers).length === 0) {
            const defaultUsers = {
                'admin@securesign.com': {
                    password: 'admin123',
                    role: 'admin',
                    name: 'Administrator',
                    organization: 'SecureSign PKI',
                    registeredDate: new Date().toISOString(),
                    certificate: {
                        serial: '4F:3A:B2:C1:D8:E9:12:45',
                        issued: 'January 1, 2025',
                        expiry: 'December 31, 2026',
                        status: 'Active'
                    },
                    documents: []
                },
                'user@securesign.com': {
                    password: 'user123',
                    role: 'user',
                    name: 'John Doe',
                    organization: 'TechCorp',
                    registeredDate: new Date().toISOString(),
                    certificate: {
                        serial: '8D:1F:5E:A3:B7:C4:91:62',
                        issued: 'January 1, 2025',
                        expiry: 'December 31, 2026',
                        status: 'Active'
                    },
                    documents: []
                }
            };
            
            try {
                localStorage.setItem(this.USERS_KEY, JSON.stringify(defaultUsers));
                console.log('Default users initialized successfully');
            } catch (error) {
                console.error('Error initializing default users:', error);
            }
        }
    }

    getAllUsers() {
        try {
            const users = localStorage.getItem(this.USERS_KEY);
            return users ? JSON.parse(users) : {};
        } catch (error) {
            console.error('Error reading users from localStorage:', error);
            return {};
        }
    }

    saveUsers(users) {
        try {
            const jsonString = JSON.stringify(users);
            const sizeInBytes = jsonString.length * 2;
            const sizeInMB = sizeInBytes / (1024 * 1024);
            
            console.log('Attempting to save users. Size:', sizeInMB.toFixed(2), 'MB');
            
            if (sizeInMB > 4.5) {
                console.warn('Warning: Approaching localStorage size limit');
            }
            
            localStorage.setItem(this.USERS_KEY, jsonString);
            console.log('Users saved successfully');
            return true;
        } catch (error) {
            console.error('Error saving users to localStorage:', error);
            
            if (error.name === 'QuotaExceededError' || error.code === 22) {
                console.error('localStorage quota exceeded!');
                return false;
            }
            
            throw error;
        }
    }

    // FIXED REGISTER METHOD with better error handling
    async register(email, password, fullName, organization = '') {
        const users = this.getAllUsers();

        // Check if user already exists
        if (users[email]) {
            return {
                success: false,
                message: 'An account with this email already exists'
            };
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return {
                success: false,
                message: 'Please enter a valid email address'
            };
        }

        // Validate password strength (minimum 6 characters)
        if (password.length < 6) {
            return {
                success: false,
                message: 'Password must be at least 6 characters long'
            };
        }

        // Generate certificate details for new user
        const serialNumber = this.generateSerialNumber();
        const currentDate = new Date();
        const expiryDate = new Date(currentDate);
        expiryDate.setFullYear(expiryDate.getFullYear() + 2);

        // Check if cryptoUtils is available
        if (typeof cryptoUtils === 'undefined') {
            console.error('cryptoUtils is not defined! Make sure crypto-utils.js is loaded before auth.js');
            return {
                success: false,
                message: 'Registration failed - cryptographic module not loaded. Please refresh the page.'
            };
        }

        // Generate RSA key pair for the new user
        try {
            console.log('Starting key generation...');
            const keyPair = await cryptoUtils.generateKeyPair(2048);
            console.log('Key pair generated');
            
            const publicKeyPem = await cryptoUtils.exportPublicKey(keyPair.publicKey);
            console.log('Public key exported');
            
            const privateKeyPem = await cryptoUtils.exportPrivateKey(keyPair.privateKey);
            console.log('Private key exported');
            
            const fingerprint = await cryptoUtils.generateKeyFingerprint(publicKeyPem);
            console.log('Fingerprint generated:', fingerprint.substring(0, 20) + '...');

            // Create new user with keys
            users[email] = {
                password: password,
                role: 'user',
                name: fullName,
                organization: organization,
                registeredDate: currentDate.toISOString(),
                keys: {
                    publicKey: publicKeyPem,
                    privateKey: privateKeyPem,
                    fingerprint: fingerprint,
                    algorithm: 'RSA-2048',
                    generated: currentDate.toISOString()
                },
                certificate: {
                    serial: serialNumber,
                    issued: currentDate.toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                    }),
                    expiry: expiryDate.toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                    }),
                    status: 'Active',
                    publicKeyFingerprint: fingerprint
                },
                documents: []
            };

            const saved = this.saveUsers(users);
            
            if (!saved) {
                return {
                    success: false,
                    message: 'Registration failed - storage quota exceeded'
                };
            }

            console.log('User registered successfully with cryptographic keys');
            return {
                success: true,
                message: 'Registration successful! Your cryptographic keys have been generated.'
            };
            
        } catch (error) {
            console.error('Error generating keys during registration:', error);
            console.error('Error stack:', error.stack);
            return {
                success: false,
                message: 'Registration failed: ' + error.message
            };
        }
    }

    login(email, password) {
        const users = this.getAllUsers();
        const user = users[email];

        if (!user) {
            return {
                success: false,
                message: 'Invalid email or password'
            };
        }

        if (user.password !== password) {
            return {
                success: false,
                message: 'Invalid email or password'
            };
        }

        const session = {
            email: email,
            role: user.role,
            name: user.name,
            organization: user.organization,
            loginTime: new Date().toISOString()
        };

        try {
            localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
        } catch (error) {
            console.error('Error creating session:', error);
        }

        this.logAuditEvent('USER_LOGIN', email, 'User logged in successfully');

        return {
            success: true,
            message: 'Login successful!',
            user: session
        };
    }

    logout() {
        const session = this.getCurrentSession();
        if (session) {
            this.logAuditEvent('USER_LOGOUT', session.email, 'User logged out');
        }
        localStorage.removeItem(this.SESSION_KEY);
        return {
            success: true,
            message: 'Logged out successfully'
        };
    }

    getCurrentSession() {
        try {
            const session = localStorage.getItem(this.SESSION_KEY);
            return session ? JSON.parse(session) : null;
        } catch (error) {
            console.error('Error reading session:', error);
            return null;
        }
    }

    isAuthenticated() {
        return this.getCurrentSession() !== null;
    }

    getUserDetails(email) {
        const users = this.getAllUsers();
        const user = users[email];
        
        if (user) {
            console.log('getUserDetails for', email, '- has documents:', !!user.documents, 'count:', user.documents ? user.documents.length : 0);
        }
        
        return user || null;
    }

    async updateUser(email, updates) {
        try {
            const users = this.getAllUsers();
            
            if (!users[email]) {
                return { success: false, message: 'User not found' };
            }
            
            if (updates.documents) {
                const documents = updates.documents;
                delete updates.documents;
                
                for (const doc of documents) {
                    await documentStorage.saveDocument(email, doc);
                }
            }
            
            users[email] = { ...users[email], ...updates };
            
            const saved = this.saveUsers(users);
            
            if (!saved) {
                return { 
                    success: false, 
                    message: 'Storage quota exceeded' 
                };
            }
            
            return { success: true, message: 'User updated successfully' };
            
        } catch (error) {
            console.error('Error in updateUser:', error);
            return { 
                success: false, 
                message: 'Error updating user: ' + error.message 
            };
        }
    }

    async getUserDetailsWithDocs(email) {
        const user = this.getUserDetails(email);
        if (user) {
            user.documents = await documentStorage.getUserDocuments(email);
        }
        return user;
    }

    generateSerialNumber() {
        const segments = 8;
        let serial = '';
        for (let i = 0; i < segments; i++) {
            const segment = Math.floor(Math.random() * 256).toString(16).toUpperCase().padStart(2, '0');
            serial += segment;
            if (i < segments - 1) serial += ':';
        }
        return serial;
    }

    logAuditEvent(eventType, user, action, status = 'Success') {
        try {
            const AUDIT_KEY = 'securesign_audit_logs';
            const logs = JSON.parse(localStorage.getItem(AUDIT_KEY) || '[]');
            
            const auditEntry = {
                timestamp: new Date().toISOString(),
                eventType: eventType,
                user: user,
                action: action,
                ipAddress: '192.168.1.100',
                status: status
            };

            logs.unshift(auditEntry);
            
            if (logs.length > 100) {
                logs.splice(100);
            }

            localStorage.setItem(AUDIT_KEY, JSON.stringify(logs));
        } catch (error) {
            console.error('Error logging audit event:', error);
        }
    }

    getAuditLogs(limit = 50) {
        try {
            const AUDIT_KEY = 'securesign_audit_logs';
            const logs = JSON.parse(localStorage.getItem(AUDIT_KEY) || '[]');
            return logs.slice(0, limit);
        } catch (error) {
            console.error('Error reading audit logs:', error);
            return [];
        }
    }

    getAllUsersForAdmin() {
        const users = this.getAllUsers();
        const userList = [];

        for (const [email, data] of Object.entries(users)) {
            userList.push({
                email: email,
                name: data.name,
                organization: data.organization,
                role: data.role,
                registeredDate: data.registeredDate,
                certificate: data.certificate
            });
        }

        return userList;
    }

    deleteUser(email) {
        const users = this.getAllUsers();
        if (users[email]) {
            delete users[email];
            this.saveUsers(users);
            this.logAuditEvent('USER_DELETED', 'admin', `Deleted user: ${email}`);
            return { success: true, message: 'User deleted successfully' };
        }
        return { success: false, message: 'User not found' };
    }

    revokeCertificate(email) {
        const users = this.getAllUsers();
        if (users[email] && users[email].certificate) {
            users[email].certificate.status = 'Revoked';
            this.saveUsers(users);
            this.logAuditEvent('CERTIFICATE_REVOKED', 'admin', `Revoked certificate for: ${email}`);
            return { success: true, message: 'Certificate revoked successfully' };
        }
        return { success: false, message: 'User or certificate not found' };
    }

    getSystemStats() {
        const users = this.getAllUsers();
        const userCount = Object.keys(users).length;
        
        let activeCerts = 0;
        let revokedCerts = 0;
        let totalDocs = 0;

        for (const userData of Object.values(users)) {
            if (userData.certificate) {
                if (userData.certificate.status === 'Active') {
                    activeCerts++;
                } else if (userData.certificate.status === 'Revoked') {
                    revokedCerts++;
                }
            }
            if (userData.documents) {
                totalDocs += userData.documents.length;
            }
        }

        return {
            totalUsers: userCount,
            activeCertificates: activeCerts,
            revokedCertificates: revokedCerts,
            totalDocuments: totalDocs
        };
    }
}

// Create global instance
const authManager = new AuthManager();

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AuthManager;
}