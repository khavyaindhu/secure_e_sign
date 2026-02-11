# E-Signature & Document Verification System - Frontend

## 📋 Project Overview

This is a **frontend-only** implementation of a secure e-signature and document verification system based on Public Key Infrastructure (PKI). The application provides a complete user interface for both regular users and administrators, with mock authentication for development purposes.

---

## 🎯 What's Included in This ZIP File

### ✅ **Fully Implemented Frontend Features**

#### 1. **Authentication System**
- ✅ Login screen with email/password authentication
- ✅ Registration screen with full form validation
- ✅ Mock authentication with test credentials
- ✅ Session management (simulated)
- ✅ Role-based access (User vs Admin)

**Test Credentials:**
- **Admin:** admin@securesign.com / admin123
- **User:** user@securesign.com / user123

#### 2. **User Dashboard** (Complete UI)
- ✅ Upload Document Tab
  - Drag-and-drop file upload
  - File preview with metadata
  - Signature options (reason, location)
  - Sign document button with mock signing
- ✅ My Documents Tab
  - Document cards with status badges
  - Sample documents (Employment Contract, NDA, Purchase Order)
  - Action buttons (Download, View, Sign)
- ✅ Verify Document Tab
  - Upload area for signed documents
  - Verification result display
  - Mock verification with detailed signature information
- ✅ My Certificate Tab
  - X.509 certificate details display
  - Certificate information (Subject, Serial, Validity)
  - Public key information
  - Action buttons (Download, View, Revoke)

#### 3. **Admin Dashboard** (Complete UI)
- ✅ Overview Tab
  - System statistics (Users, Certificates, Documents, Pending Approvals)
  - Recent activity feed
  - Visual stat cards with icons
- ✅ User Management Tab
  - User table with search functionality
  - User details (Name, Email, Organization, Certificate Status)
  - Action buttons (View, Edit)
- ✅ Certificate Authority Tab
  - CA statistics (Active, Expiring, Revoked)
  - Certificate management table
  - Issue and revoke certificate actions
- ✅ All Documents Tab
  - System-wide document listing
  - Document metadata (Owner, Upload date, Size, Status)
  - Administrative actions
- ✅ Audit Logs Tab
  - Event log table
  - Filter by event type and date
  - Detailed audit information (Timestamp, Event, User, IP)

#### 4. **UI/UX Components**
- ✅ Modern, responsive design
- ✅ Professional color scheme
- ✅ SVG icons throughout
- ✅ Status badges (Signed, Pending, Valid, Revoked)
- ✅ Interactive notifications/toasts
- ✅ Form validation feedback
- ✅ Hover effects and transitions
- ✅ Mobile-responsive layout

#### 5. **Navigation & Routing**
- ✅ Screen-based navigation (Login → Dashboard)
- ✅ Sidebar menu with active states
- ✅ Tab switching within dashboards
- ✅ Logout functionality

---

## 🚧 What You Need to Develop (Backend Integration)

### Backend Requirements (Python Flask)

#### 1. **User Authentication & Authorization API**
```python
# Endpoints to implement:
POST /api/auth/register          # User registration
POST /api/auth/login             # User login
POST /api/auth/logout            # User logout
GET  /api/auth/verify-session    # Verify session token
```

**Required:**
- JWT token generation and validation
- Password hashing (bcrypt/argon2)
- Session management
- Role-based access control (RBAC)

#### 2. **Certificate Authority (CA) & PKI Management**
```python
# Endpoints to implement:
POST /api/certificates/generate  # Generate key pair and certificate
GET  /api/certificates/user/{id} # Get user's certificate
POST /api/certificates/revoke    # Revoke a certificate
GET  /api/certificates/validate  # Validate certificate status
GET  /api/certificates/crl       # Get Certificate Revocation List
POST /api/certificates/renew     # Renew expiring certificate
```

**Required Libraries:**
- `cryptography` - For PKI operations
- `OpenSSL` - For certificate generation

**Required Implementation:**
- X.509 certificate generation (RSA 2048-bit)
- Private/Public key pair generation
- Certificate signing with CA private key
- Certificate Revocation List (CRL) management
- Certificate validation chain
- Certificate expiry tracking

#### 3. **Document Management API**
```python
# Endpoints to implement:
POST /api/documents/upload       # Upload document
GET  /api/documents/user/{id}    # Get user's documents
GET  /api/documents/{doc_id}     # Get specific document
DELETE /api/documents/{doc_id}   # Delete document
GET  /api/documents/all          # Admin: Get all documents
```

**Required:**
- File upload handling (multipart/form-data)
- Secure file storage (encrypted at rest using AES-256)
- File metadata storage (name, size, upload date, owner)
- Access control (users can only access their own documents)

#### 4. **Document Hashing & Signing API**
```python
# Endpoints to implement:
POST /api/signing/hash           # Generate document hash
POST /api/signing/sign           # Sign document
GET  /api/signing/verify         # Verify document signature
```

**Required Implementation:**
- SHA-256/SHA-3 hashing
- Digital signature generation using private key
- Signature verification using public key
- Timestamp authority integration
- Signature metadata storage (signer, timestamp, reason, location)

#### 5. **Signature Verification API**
```python
# Endpoints to implement:
POST /api/verification/verify    # Verify signed document
GET  /api/verification/details/{doc_id}  # Get verification details
```

**Required:**
- Extract signature from document
- Verify signature using signer's public key
- Validate certificate chain
- Check certificate revocation status (CRL)
- Compare document hash
- Return verification result with details

#### 6. **Admin Management API**
```python
# Endpoints to implement:
GET  /api/admin/stats            # System statistics
GET  /api/admin/users            # List all users
PUT  /api/admin/users/{id}       # Update user
DELETE /api/admin/users/{id}     # Delete user
GET  /api/admin/certificates     # List all certificates
GET  /api/admin/audit-logs       # Get audit logs
POST /api/admin/audit-logs       # Create audit log entry
```

**Required:**
- Admin authentication middleware
- User management CRUD operations
- System statistics aggregation
- Comprehensive audit logging

#### 7. **Audit Logging System**
**Required:**
- Log all critical operations:
  - User login/logout
  - Certificate issuance/revocation
  - Document upload/signing/verification
  - Admin actions
- Store: Timestamp, Event Type, User ID, IP Address, Action Details, Status

---

## 📁 Project Structure

```
e-signature-frontend/
│
├── index.html          # Main HTML file with all screens
├── styles.css          # Complete styling
├── script.js           # Frontend logic & mock authentication
└── README.md           # This file
```

---

## 🔧 Technology Stack

### Frontend (Included)
- **HTML5** - Semantic markup
- **CSS3** - Modern styling with CSS variables
- **Vanilla JavaScript** - No frameworks/libraries required
- **SVG** - Scalable vector icons

### Backend (To Be Implemented)
- **Python 3.8+** - Programming language
- **Flask** - Web framework
- **Flask-RESTful** - REST API development
- **Flask-JWT-Extended** - JWT authentication
- **Flask-SQLAlchemy** - ORM for database
- **cryptography** - PKI and encryption operations
- **PyOpenSSL** - Certificate operations
- **SQLite/PostgreSQL** - Database

---

## 🚀 Getting Started

### Running the Frontend

1. **Simply open `index.html` in a web browser**
   ```bash
   # Option 1: Double-click index.html
   
   # Option 2: Use a simple HTTP server
   python -m http.server 8000
   # Then navigate to http://localhost:8000
   ```

2. **Login with test credentials:**
   - Admin: `admin@securesign.com` / `admin123`
   - User: `user@securesign.com` / `user123`

3. **Explore all features** to understand the UI/UX before building the backend

---

## 🔐 Security Features to Implement in Backend

### 1. **Cryptographic Operations**
- RSA 2048-bit key pair generation
- X.509 certificate generation and signing
- SHA-256/SHA-3 document hashing
- Digital signature creation (PKCS#1 or PSS)
- AES-256 encryption for document storage

### 2. **PKI Infrastructure**
- Root Certificate Authority (CA)
- Certificate lifecycle management
- Certificate Revocation List (CRL)
- Certificate chain validation
- Timestamp Authority (TSA) integration

### 3. **Authentication & Authorization**
- JWT-based stateless authentication
- Password hashing with salt (bcrypt/argon2)
- Role-based access control (RBAC)
- Session timeout and refresh tokens
- Brute force protection

### 4. **Data Protection**
- Encrypted file storage (AES-256)
- Secure transmission (HTTPS/TLS)
- SQL injection prevention (parameterized queries)
- XSS protection
- CSRF token validation

### 5. **Audit & Compliance**
- Comprehensive audit logging
- Non-repudiation assurance
- Timestamp verification
- Document integrity verification
- Access control logging

---

## 📊 Database Schema (Suggested)

### Users Table
```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    organization VARCHAR(255),
    role VARCHAR(50) NOT NULL,  -- 'user' or 'admin'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Certificates Table
```sql
CREATE TABLE certificates (
    id INTEGER PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    serial_number VARCHAR(255) UNIQUE NOT NULL,
    subject VARCHAR(512) NOT NULL,
    public_key TEXT NOT NULL,
    certificate_pem TEXT NOT NULL,
    issued_at TIMESTAMP NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    status VARCHAR(50) DEFAULT 'active',  -- 'active', 'revoked', 'expired'
    revoked_at TIMESTAMP,
    revocation_reason VARCHAR(255)
);
```

### Documents Table
```sql
CREATE TABLE documents (
    id INTEGER PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    filename VARCHAR(255) NOT NULL,
    file_path VARCHAR(512) NOT NULL,
    file_size INTEGER NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    hash_sha256 VARCHAR(64) NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'unsigned'  -- 'unsigned', 'signed'
);
```

### Signatures Table
```sql
CREATE TABLE signatures (
    id INTEGER PRIMARY KEY,
    document_id INTEGER REFERENCES documents(id),
    certificate_id INTEGER REFERENCES certificates(id),
    signature_data TEXT NOT NULL,
    reason VARCHAR(255),
    location VARCHAR(255),
    signed_at TIMESTAMP NOT NULL,
    timestamp_token TEXT  -- From TSA
);
```

### Audit Logs Table
```sql
CREATE TABLE audit_logs (
    id INTEGER PRIMARY KEY,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    event_type VARCHAR(100) NOT NULL,
    user_id INTEGER REFERENCES users(id),
    action TEXT NOT NULL,
    ip_address VARCHAR(45),
    status VARCHAR(50),
    details TEXT
);
```

---

## 🧪 Testing Checklist for Backend

### Unit Tests
- [ ] Certificate generation and validation
- [ ] Digital signature creation and verification
- [ ] Document hashing (SHA-256)
- [ ] User authentication
- [ ] Access control policies

### Integration Tests
- [ ] Complete signing workflow
- [ ] Complete verification workflow
- [ ] Certificate revocation flow
- [ ] User registration and login flow

### Security Tests
- [ ] SQL injection attempts
- [ ] XSS attack prevention
- [ ] CSRF token validation
- [ ] Brute force login attempts
- [ ] Unauthorized access attempts
- [ ] Certificate tampering detection
- [ ] Document tampering detection

---

## 📚 Recommended Python Libraries

```bash
# Core Framework
pip install flask
pip install flask-restful
pip install flask-cors
pip install flask-jwt-extended

# Database
pip install flask-sqlalchemy
pip install flask-migrate

# Cryptography & PKI
pip install cryptography
pip install pyOpenSSL

# Security
pip install bcrypt
pip install argon2-cffi

# File Handling
pip install python-magic
pip install werkzeug

# Development
pip install python-dotenv
pip install flask-swagger-ui
```

---

## 🎨 UI/UX Features Already Implemented

1. **Modern Design System**
   - CSS variables for theming
   - Consistent spacing and typography
   - Professional color palette
   - Smooth transitions and animations

2. **Responsive Layout**
   - Mobile-first approach
   - Breakpoints for tablets and desktops
   - Collapsible sidebar for mobile

3. **Interactive Elements**
   - Drag-and-drop file upload
   - Real-time form validation
   - Toast notifications
   - Loading states
   - Hover effects

4. **Accessibility**
   - Semantic HTML
   - Proper form labels
   - Keyboard navigation support
   - Clear visual hierarchy

---

## 🔄 Integration Steps

### Phase 1: Basic Backend Setup
1. Set up Flask application structure
2. Configure database (SQLAlchemy)
3. Implement user authentication endpoints
4. Create basic CRUD operations for users

### Phase 2: PKI Implementation
1. Implement certificate generation
2. Create CA infrastructure
3. Develop signature generation
4. Implement verification logic

### Phase 3: Document Management
1. File upload and storage
2. Document hashing
3. Signature attachment
4. Document retrieval

### Phase 4: Frontend-Backend Connection
1. Replace mock functions with API calls
2. Implement proper error handling
3. Add loading states
4. Handle file downloads

### Phase 5: Security Hardening
1. Implement HTTPS
2. Add rate limiting
3. Configure CORS properly
4. Add comprehensive audit logging

### Phase 6: Testing & Deployment
1. Write comprehensive tests
2. Perform security audit
3. Deploy backend (AWS/Azure/GCP)
4. Deploy frontend (separate or same server)

---

## 📖 API Integration Guide

To connect the frontend to your Flask backend, update the JavaScript as follows:

```javascript
// Example: Update handleLogin function
async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const response = await fetch('http://your-backend-url/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('token', data.token);
            currentUser = data.user;
            
            if (currentUser.role === 'admin') {
                showScreen('adminDashboard');
            } else {
                showScreen('userDashboard');
            }
        } else {
            showNotification('Invalid credentials', 'error');
        }
    } catch (error) {
        showNotification('Network error', 'error');
    }
}
```

---

## 🎯 Next Steps

1. **Review the frontend** - Understand all UI components and flows
2. **Design your backend architecture** - Plan your Flask application structure
3. **Set up development environment** - Install Python, Flask, and required libraries
4. **Implement authentication first** - Start with user registration and login
5. **Build PKI infrastructure** - This is the core of the system
6. **Integrate frontend with backend** - Replace mock functions with API calls
7. **Test thoroughly** - Security is critical for this application
8. **Deploy** - Choose appropriate hosting (consider security requirements)

---

## 📞 Support & Documentation

### Additional Resources Needed
- PKI/Cryptography documentation
- Flask REST API best practices
- Digital signature standards (PKCS#7, CAdES)
- Certificate standards (X.509, RFC 5280)
- Timestamp Authority protocols (RFC 3161)

### Frontend Modification
All frontend code is in `script.js`. Key functions to modify when connecting to backend:
- `handleLogin()` - Replace with API call
- `handleRegister()` - Replace with API call
- `handleFileSelect()` - Add actual file upload
- `handleSignDocument()` - Connect to signing API
- `handleVerifyDocument()` - Connect to verification API

---

## ⚠️ Important Notes

1. **Security First**: Never store private keys on the server. Generate them client-side or use HSM.
2. **Legal Compliance**: Ensure compliance with eIDAS, ESIGN Act, or relevant e-signature laws.
3. **Certificate Storage**: Consider using Hardware Security Modules (HSM) for production.
4. **Timestamp Authority**: Integrate a trusted TSA for legal non-repudiation.
5. **Backup Strategy**: Implement secure backup for certificates and keys.

---

## 📄 License

This frontend template is provided as-is for educational and development purposes.

---

**Good luck with your backend development! 🚀**
