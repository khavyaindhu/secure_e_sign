# Backend API Specification

## 📡 Complete API Endpoints for Flask Backend

---

## 🔐 Authentication APIs

### 1. User Registration
```
POST /api/auth/register
```

**Request Body:**
```json
{
  "full_name": "John Doe",
  "email": "john.doe@example.com",
  "password": "SecurePass123",
  "organization": "TechCorp"
}
```

**Response (201 Created):**
```json
{
  "message": "User registered successfully",
  "user_id": 123
}
```

**Implementation:**
- Hash password (bcrypt/argon2)
- Validate email format
- Check for duplicate email
- Generate initial certificate request

---

### 2. User Login
```
POST /api/auth/login
```

**Request Body:**
```json
{
  "email": "john.doe@example.com",
  "password": "SecurePass123"
}
```

**Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 123,
    "email": "john.doe@example.com",
    "name": "John Doe",
    "role": "user"
  }
}
```

**Implementation:**
- Verify email and password
- Generate JWT token
- Return user info and token
- Log login event

---

### 3. Logout
```
POST /api/auth/logout
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "message": "Logged out successfully"
}
```

---

### 4. Verify Session
```
GET /api/auth/verify-session
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "valid": true,
  "user": {
    "id": 123,
    "email": "john.doe@example.com",
    "role": "user"
  }
}
```

---

## 🔏 Certificate Management APIs

### 5. Generate Certificate
```
POST /api/certificates/generate
```

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "common_name": "John Doe",
  "organization": "TechCorp",
  "country": "US",
  "validity_days": 365
}
```

**Response (201 Created):**
```json
{
  "certificate_id": 456,
  "serial_number": "4F:3A:B2:C1:D8:E9:12:45",
  "public_key": "-----BEGIN PUBLIC KEY-----\n...",
  "certificate_pem": "-----BEGIN CERTIFICATE-----\n...",
  "issued_at": "2025-02-11T10:00:00Z",
  "expires_at": "2026-02-11T10:00:00Z"
}
```

**Implementation:**
- Generate RSA 2048-bit key pair
- Create X.509 certificate
- Sign with CA private key
- Store certificate in database
- Return certificate to user

---

### 6. Get User Certificate
```
GET /api/certificates/user
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "certificate_id": 456,
  "serial_number": "4F:3A:B2:C1:D8:E9:12:45",
  "subject": "CN=John Doe, O=TechCorp, C=US",
  "issued_at": "2025-02-11T10:00:00Z",
  "expires_at": "2026-02-11T10:00:00Z",
  "status": "active",
  "public_key_fingerprint": "B4:7F:3C:2A:1D...",
  "certificate_pem": "-----BEGIN CERTIFICATE-----\n..."
}
```

---

### 7. Revoke Certificate
```
POST /api/certificates/revoke
```

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "certificate_id": 456,
  "reason": "Key compromise"
}
```

**Response (200 OK):**
```json
{
  "message": "Certificate revoked successfully",
  "revoked_at": "2025-02-11T12:00:00Z"
}
```

**Implementation:**
- Update certificate status to 'revoked'
- Add to Certificate Revocation List (CRL)
- Log revocation event

---

### 8. Get Certificate Revocation List
```
GET /api/certificates/crl
```

**Response (200 OK):**
```json
{
  "revoked_certificates": [
    {
      "serial_number": "8D:1F:5E:A3:...",
      "revoked_at": "2025-02-10T15:00:00Z",
      "reason": "Key compromise"
    }
  ]
}
```

---

### 9. Validate Certificate
```
POST /api/certificates/validate
```

**Request Body:**
```json
{
  "certificate_pem": "-----BEGIN CERTIFICATE-----\n..."
}
```

**Response (200 OK):**
```json
{
  "valid": true,
  "status": "active",
  "subject": "CN=John Doe",
  "expires_at": "2026-02-11T10:00:00Z",
  "revocation_status": "not_revoked"
}
```

---

## 📄 Document Management APIs

### 10. Upload Document
```
POST /api/documents/upload
```

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Form Data:**
```
file: <binary file>
```

**Response (201 Created):**
```json
{
  "document_id": 789,
  "filename": "contract.pdf",
  "size": 1245678,
  "hash_sha256": "a3f5b8c2d9e1f4a7b2c8d3e9f1a4b7c2...",
  "uploaded_at": "2025-02-11T11:00:00Z"
}
```

**Implementation:**
- Validate file type (PDF, DOC, DOCX)
- Calculate SHA-256 hash
- Encrypt file with AES-256
- Store encrypted file
- Save metadata to database

---

### 11. Get User Documents
```
GET /api/documents/user
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "documents": [
    {
      "document_id": 789,
      "filename": "contract.pdf",
      "size": 1245678,
      "uploaded_at": "2025-02-11T11:00:00Z",
      "status": "signed",
      "hash_sha256": "a3f5b8c2d9e1..."
    }
  ]
}
```

---

### 12. Get Specific Document
```
GET /api/documents/{document_id}
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
- Returns the actual file for download

**Implementation:**
- Verify user owns document
- Decrypt file
- Stream file to client

---

### 13. Delete Document
```
DELETE /api/documents/{document_id}
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "message": "Document deleted successfully"
}
```

---

## ✍️ Digital Signature APIs

### 14. Generate Document Hash
```
POST /api/signing/hash
```

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "document_id": 789
}
```

**Response (200 OK):**
```json
{
  "hash_sha256": "a3f5b8c2d9e1f4a7b2c8d3e9f1a4b7c2d8e3f9a1b5c7d2e8f3a9b4c6d1e7f2a8"
}
```

---

### 15. Sign Document
```
POST /api/signing/sign
```

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "document_id": 789,
  "reason": "Agreement approval",
  "location": "New York, USA"
}
```

**Response (200 OK):**
```json
{
  "signature_id": 321,
  "document_id": 789,
  "signature_data": "base64_encoded_signature...",
  "signed_at": "2025-02-11T12:00:00Z",
  "timestamp_token": "base64_encoded_timestamp..."
}
```

**Implementation:**
- Get document hash
- Sign hash with user's private key
- Get timestamp from TSA
- Attach signature to document
- Update document status to 'signed'

---

## ✅ Signature Verification APIs

### 16. Verify Document Signature
```
POST /api/verification/verify
```

**Headers:**
```
Content-Type: multipart/form-data
```

**Form Data:**
```
file: <signed document>
```

**Response (200 OK):**
```json
{
  "valid": true,
  "verification_details": {
    "signer": {
      "name": "John Doe",
      "email": "john.doe@example.com"
    },
    "signed_at": "2025-02-11T12:00:00Z",
    "certificate_valid": true,
    "certificate_status": "active",
    "document_integrity": "verified",
    "timestamp_valid": true,
    "hash_match": true
  }
}
```

**Implementation:**
- Extract signature from document
- Get signer's public key from certificate
- Verify signature using public key
- Validate certificate chain
- Check CRL for revocation
- Verify timestamp
- Compare document hash

---

### 17. Get Verification Details
```
GET /api/verification/details/{document_id}
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "document_id": 789,
  "signatures": [
    {
      "signature_id": 321,
      "signer": "John Doe",
      "signed_at": "2025-02-11T12:00:00Z",
      "status": "valid"
    }
  ]
}
```

---

## 👨‍💼 Admin APIs

### 18. Get System Statistics
```
GET /api/admin/stats
```

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response (200 OK):**
```json
{
  "total_users": 1247,
  "total_certificates": 3892,
  "documents_signed": 12456,
  "pending_approvals": 23,
  "certificates_expiring_soon": 47,
  "revoked_certificates": 112
}
```

---

### 19. List All Users
```
GET /api/admin/users
```

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Query Parameters:**
```
?search=john&page=1&limit=20
```

**Response (200 OK):**
```json
{
  "users": [
    {
      "id": 123,
      "name": "John Doe",
      "email": "john.doe@example.com",
      "organization": "TechCorp",
      "certificate_status": "active",
      "registered_at": "2025-01-01T00:00:00Z"
    }
  ],
  "total": 1247,
  "page": 1,
  "limit": 20
}
```

---

### 20. Update User
```
PUT /api/admin/users/{user_id}
```

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Request Body:**
```json
{
  "name": "John Doe Updated",
  "organization": "NewCorp"
}
```

**Response (200 OK):**
```json
{
  "message": "User updated successfully"
}
```

---

### 21. Delete User
```
DELETE /api/admin/users/{user_id}
```

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response (200 OK):**
```json
{
  "message": "User deleted successfully"
}
```

---

### 22. List All Certificates
```
GET /api/admin/certificates
```

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response (200 OK):**
```json
{
  "certificates": [
    {
      "certificate_id": 456,
      "serial_number": "4F:3A:B2:C1",
      "subject": "CN=John Doe",
      "user_email": "john.doe@example.com",
      "issued_at": "2025-02-11T10:00:00Z",
      "expires_at": "2026-02-11T10:00:00Z",
      "status": "active"
    }
  ]
}
```

---

### 23. List All Documents
```
GET /api/admin/documents
```

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response (200 OK):**
```json
{
  "documents": [
    {
      "document_id": 789,
      "filename": "contract.pdf",
      "owner_email": "john.doe@example.com",
      "size": 1245678,
      "uploaded_at": "2025-02-11T11:00:00Z",
      "status": "signed"
    }
  ]
}
```

---

### 24. Get Audit Logs
```
GET /api/admin/audit-logs
```

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Query Parameters:**
```
?event_type=LOGIN_ATTEMPT&date=2025-02-11&page=1&limit=50
```

**Response (200 OK):**
```json
{
  "logs": [
    {
      "log_id": 999,
      "timestamp": "2025-02-11T14:23:15Z",
      "event_type": "CERTIFICATE_ISSUED",
      "user_email": "admin@example.com",
      "action": "Issued certificate to john.doe@example.com",
      "ip_address": "192.168.1.100",
      "status": "success"
    }
  ],
  "total": 5000,
  "page": 1,
  "limit": 50
}
```

---

### 25. Create Audit Log Entry
```
POST /api/admin/audit-logs
```

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Request Body:**
```json
{
  "event_type": "MANUAL_ENTRY",
  "action": "System maintenance performed",
  "ip_address": "192.168.1.100",
  "status": "success"
}
```

**Response (201 Created):**
```json
{
  "message": "Audit log created successfully",
  "log_id": 1000
}
```

---

## 🔒 Authentication & Authorization

### JWT Token Structure
```json
{
  "user_id": 123,
  "email": "john.doe@example.com",
  "role": "user",
  "exp": 1707656400
}
```

### Authorization Levels
- **Public**: Register, Login
- **User**: All user document/certificate operations
- **Admin**: All admin operations + user operations

### Error Responses

**401 Unauthorized:**
```json
{
  "error": "Unauthorized",
  "message": "Invalid or missing token"
}
```

**403 Forbidden:**
```json
{
  "error": "Forbidden",
  "message": "Insufficient permissions"
}
```

**404 Not Found:**
```json
{
  "error": "Not Found",
  "message": "Resource not found"
}
```

**500 Internal Server Error:**
```json
{
  "error": "Internal Server Error",
  "message": "An unexpected error occurred"
}
```

---

## 📊 Rate Limiting

Implement rate limiting on sensitive endpoints:
- Login: 5 attempts per 15 minutes
- Registration: 3 per hour
- File upload: 10 per hour per user
- Signature operations: 20 per hour per user

---

## 🔐 Security Headers

All responses should include:
```
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Content-Security-Policy: default-src 'self'
```

---

## 📝 Implementation Priority

### Phase 1 (MVP)
1. Authentication APIs (1-4)
2. Certificate Generation (5, 6)
3. Document Upload/Retrieval (10, 11, 12)
4. Basic Signing (14, 15)
5. Basic Verification (16)

### Phase 2 (Enhanced)
1. Certificate Revocation (7, 8, 9)
2. Complete Admin APIs (18-25)
3. Advanced verification features

### Phase 3 (Production)
1. Rate limiting
2. Comprehensive audit logging
3. Performance optimization
4. Security hardening

---

This specification provides all the API endpoints you need to implement in your Flask backend to fully integrate with the provided frontend.
