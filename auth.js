// ==========================================
// LOCAL STORAGE AUTHENTICATION SYSTEM
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
                    password: 'admin123', // In production, this should be hashed
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
                    documents: [] // Initialize empty documents array
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
                    documents: [] // Initialize empty documents array
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

    // Get all users from localStorage
    getAllUsers() {
        try {
            const users = localStorage.getItem(this.USERS_KEY);
            return users ? JSON.parse(users) : {};
        } catch (error) {
            console.error('Error reading users from localStorage:', error);
            return {};
        }
    }

    // Save users to localStorage with error handling
    saveUsers(users) {
        try {
            const jsonString = JSON.stringify(users);
            
            // Check approximate size (1 char ≈ 2 bytes in UTF-16)
            const sizeInBytes = jsonString.length * 2;
            const sizeInMB = sizeInBytes / (1024 * 1024);
            
            console.log('Attempting to save users. Size:', sizeInMB.toFixed(2), 'MB');
            
            // localStorage limit is typically 5-10MB
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

    // Register a new user
    register(email, password, fullName, organization = '') {
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
        expiryDate.setFullYear(expiryDate.getFullYear() + 2); // 2 year validity

        // Create new user
        users[email] = {
            password: password, // In production, hash this password
            role: 'user',
            name: fullName,
            organization: organization,
            registeredDate: currentDate.toISOString(),
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
                status: 'Active'
            },
            documents: [] // Initialize empty documents array
        };

        const saved = this.saveUsers(users);
        
        if (!saved) {
            return {
                success: false,
                message: 'Registration failed - storage quota exceeded'
            };
        }

        return {
            success: true,
            message: 'Registration successful! Please login with your credentials.'
        };
    }

    // Login user
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

        // Create session
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

        // Log audit event
        this.logAuditEvent('USER_LOGIN', email, 'User logged in successfully');

        return {
            success: true,
            message: 'Login successful!',
            user: session
        };
    }

    // Logout user
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

    // Get current session
    getCurrentSession() {
        try {
            const session = localStorage.getItem(this.SESSION_KEY);
            return session ? JSON.parse(session) : null;
        } catch (error) {
            console.error('Error reading session:', error);
            return null;
        }
    }

    // Check if user is authenticated
    isAuthenticated() {
        return this.getCurrentSession() !== null;
    }

    // Get user details
    getUserDetails(email) {
        const users = this.getAllUsers();
        const user = users[email];
        
        if (user) {
            console.log('getUserDetails for', email, '- has documents:', !!user.documents, 'count:', user.documents ? user.documents.length : 0);
        }
        
        return user || null;
    }

// In AuthManager class, modify updateUser method
async updateUser(email, updates) {
    try {
        const users = this.getAllUsers();
        
        if (!users[email]) {
            return { success: false, message: 'User not found' };
        }
        
        // If documents are being updated, save them to IndexedDB instead
        if (updates.documents) {
            const documents = updates.documents;
            delete updates.documents; // Remove from localStorage update
            
            // Save each document to IndexedDB
            for (const doc of documents) {
                await documentStorage.saveDocument(email, doc);
            }
        }
        
        // Save other user data to localStorage (without documents)
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

// Add method to get user details with documents from IndexedDB
async getUserDetailsWithDocs(email) {
    const user = this.getUserDetails(email);
    if (user) {
        user.documents = await documentStorage.getUserDocuments(email);
    }
    return user;
}

    // Generate random serial number for certificate
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

    // Audit logging
    logAuditEvent(eventType, user, action, status = 'Success') {
        try {
            const AUDIT_KEY = 'securesign_audit_logs';
            const logs = JSON.parse(localStorage.getItem(AUDIT_KEY) || '[]');
            
            const auditEntry = {
                timestamp: new Date().toISOString(),
                eventType: eventType,
                user: user,
                action: action,
                ipAddress: '192.168.1.100', // Simulated IP
                status: status
            };

            logs.unshift(auditEntry); // Add to beginning
            
            // Keep only last 100 logs
            if (logs.length > 100) {
                logs.splice(100);
            }

            localStorage.setItem(AUDIT_KEY, JSON.stringify(logs));
        } catch (error) {
            console.error('Error logging audit event:', error);
        }
    }

    // Get audit logs
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

    // Get all users (admin only)
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

    // Delete user (admin only)
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

    // Revoke certificate (admin only)
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

    // Get system statistics (admin only)
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