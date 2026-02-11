// ==========================================
// MAIN APPLICATION SCRIPT
// Integrated with localStorage Authentication
// Enhanced with File Storage
// ==========================================

// Current session
let currentUser = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Check if user is already logged in
    const session = authManager.getCurrentSession();
    if (session) {
        currentUser = session;
        if (session.role === 'admin') {
            document.getElementById('adminName').textContent = session.name;
            showScreen('adminDashboard');
            loadAdminData();
        } else {
            document.getElementById('userName').textContent = session.name;
            showScreen('userDashboard');
            loadUserData();
        }
    } else {
        showScreen('loginScreen');
    }

    initializeEventListeners();
});

// Prevent default drag and drop behavior on the entire document
document.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.stopPropagation();
});

document.addEventListener('drop', (e) => {
    e.preventDefault();
    e.stopPropagation();
});

// Event Listeners
function initializeEventListeners() {
    // Auth navigation
    document.getElementById('showRegister').addEventListener('click', (e) => {
        e.preventDefault();
        showScreen('registerScreen');
    });

    document.getElementById('showLogin').addEventListener('click', (e) => {
        e.preventDefault();
        showScreen('loginScreen');
    });

    // Login form
    document.getElementById('loginForm').addEventListener('submit', handleLogin);

    // Registration form
    document.getElementById('registerForm').addEventListener('submit', handleRegister);

    // Logout buttons
    document.getElementById('userLogout').addEventListener('click', handleLogout);
    document.getElementById('adminLogout').addEventListener('click', handleLogout);

    // User dashboard tabs
    const userTabs = document.querySelectorAll('#userDashboard .menu-item');
    userTabs.forEach(tab => {
        tab.addEventListener('click', () => switchTab(tab, 'user'));
    });

    // Admin dashboard tabs
    const adminTabs = document.querySelectorAll('#adminDashboard .menu-item');
    adminTabs.forEach(tab => {
        tab.addEventListener('click', () => switchTab(tab, 'admin'));
    });

    // File upload
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');

    uploadArea.addEventListener('click', () => fileInput.click());
    
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.stopPropagation();
        uploadArea.style.borderColor = 'var(--primary-color)';
        uploadArea.style.background = '#F5F3FF';
    });

    uploadArea.addEventListener('dragleave', (e) => {
        e.preventDefault();
        e.stopPropagation();
        uploadArea.style.borderColor = 'var(--border-color)';
        uploadArea.style.background = 'var(--card-bg)';
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        e.stopPropagation();
        uploadArea.style.borderColor = 'var(--border-color)';
        uploadArea.style.background = 'var(--card-bg)';
        
        if (e.dataTransfer.files.length > 0) {
            handleFileSelect(e.dataTransfer.files[0]);
        }
    });

    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFileSelect(e.target.files[0]);
        }
    });

    // Remove file
    document.getElementById('removeFile').addEventListener('click', () => {
        document.getElementById('uploadArea').style.display = 'block';
        document.getElementById('filePreview').style.display = 'none';
        fileInput.value = '';
        currentFile = null;
        currentFileData = null;
    });

    // Sign document
    document.getElementById('signDocument').addEventListener('click', handleSignDocument);

    // Verify upload
    const verifyUploadArea = document.getElementById('verifyUploadArea');
    const verifyFileInput = document.getElementById('verifyFileInput');

    verifyUploadArea.addEventListener('click', () => verifyFileInput.click());

    verifyFileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleVerifyDocument(e.target.files[0]);
        }
    });

    verifyUploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.stopPropagation();
        verifyUploadArea.style.borderColor = 'var(--primary-color)';
        verifyUploadArea.style.background = '#F5F3FF';
    });

    verifyUploadArea.addEventListener('dragleave', (e) => {
        e.preventDefault();
        e.stopPropagation();
        verifyUploadArea.style.borderColor = 'var(--border-color)';
        verifyUploadArea.style.background = 'var(--card-bg)';
    });

    verifyUploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        e.stopPropagation();
        verifyUploadArea.style.borderColor = 'var(--border-color)';
        verifyUploadArea.style.background = 'var(--card-bg)';
        
        if (e.dataTransfer.files.length > 0) {
            handleVerifyDocument(e.dataTransfer.files[0]);
        }
    });
}

// Screen management
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
}

// ==========================================
// AUTHENTICATION HANDLERS
// ==========================================

function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;

    const result = authManager.login(email, password);

    if (result.success) {
        currentUser = result.user;

        if (currentUser.role === 'admin') {
            document.getElementById('adminName').textContent = currentUser.name;
            showScreen('adminDashboard');
            loadAdminData();
        } else {
            document.getElementById('userName').textContent = currentUser.name;
            showScreen('userDashboard');
            loadUserData();
        }

        // Reset form
        document.getElementById('loginForm').reset();
        showNotification(result.message, 'success');
    } else {
        showNotification(result.message, 'error');
    }
}


function handleRegister(e) {
    e.preventDefault();

    const fullName = document.getElementById('regFullName').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const organization = document.getElementById('regOrganization').value.trim();
    const password = document.getElementById('regPassword').value;
    const confirmPassword = document.getElementById('regConfirmPassword').value;

    // Validate inputs
    if (!fullName || !email || !password || !confirmPassword) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }

    if (password !== confirmPassword) {
        showNotification('Passwords do not match', 'error');
        return;
    }

    // IMPORTANT: Call register with .then() because it's async
    authManager.register(email, password, fullName, organization)
        .then(result => {
            if (result.success) {
                showNotification(result.message, 'success');
                document.getElementById('registerForm').reset();
                
                // Automatically switch to login screen after 1.5 seconds
                setTimeout(() => {
                    showScreen('loginScreen');
                    // Pre-fill email for convenience
                    document.getElementById('loginEmail').value = email;
                }, 1500);
            } else {
                showNotification(result.message, 'error');
            }
        })
        .catch(error => {
            console.error('Registration error:', error);
            showNotification('Registration failed: ' + error.message, 'error');
        });
}


function handleLogout() {
    const result = authManager.logout();
    currentUser = null;
    showScreen('loginScreen');
    showNotification(result.message, 'success');
}

// ==========================================
// DATA LOADING FUNCTIONS
// ==========================================

async function loadUserData() {
    if (!currentUser) return;

    const userDetails = await authManager.getUserDetailsWithDocs(currentUser.email);
    if (!userDetails) return;

    loadUserCertificate(userDetails);
    loadUserDocuments(userDetails);
}

function loadUserCertificate(userDetails) {
    if (!userDetails.certificate) return;

    const cert = userDetails.certificate;
    const certSection = document.querySelector('#certificateTab .certificate-card');
    
    if (certSection) {
        const infoRows = certSection.querySelectorAll('.info-row');
        if (infoRows.length >= 7) {
            infoRows[0].querySelector('span').textContent = `CN=${userDetails.name}, O=${userDetails.organization || 'N/A'}, C=US`;
            infoRows[1].querySelector('span').textContent = currentUser.email;
            infoRows[2].querySelector('span').textContent = cert.serial;
            infoRows[4].querySelector('span').textContent = cert.issued;
            infoRows[5].querySelector('span').textContent = cert.expiry;
            
            const statusBadge = infoRows[6].querySelector('.status-badge');
            statusBadge.textContent = cert.status;
            statusBadge.className = `status-badge ${cert.status === 'Active' ? 'valid' : 'revoked'}`;
        }
        
        // Update key information section
        const keyInfoCard = document.querySelector('.key-info-card');
        if (keyInfoCard && userDetails.keys) {
            const keyInfoRows = keyInfoCard.querySelectorAll('.info-row');
            if (keyInfoRows.length >= 3) {
                // Update fingerprint with real value
                keyInfoRows[1].querySelector('.hash-text').textContent = 
                    userDetails.keys.fingerprint || 'Not available';
            }
        }
    }
}

function loadUserDocuments(userDetails) {
    const documentsGrid = document.querySelector('#documentsTab .documents-grid');
    if (!documentsGrid) {
        console.error('ERROR: documents-grid element not found!');
        return;
    }

    // Clear existing documents
    documentsGrid.innerHTML = '';

    console.log('Loading documents for user:', currentUser.email);
    console.log('User details:', userDetails);
    console.log('Documents array:', userDetails.documents);

    if (!userDetails.documents || userDetails.documents.length === 0) {
        documentsGrid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #6B7280; background: white;">
                <svg style="width: 64px; height: 64px; margin: 0 auto 16px; opacity: 0.5;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
                <h3 style="margin: 16px 0 8px; font-size: 18px; color: #374151;">No documents yet</h3>
                <p style="margin: 0; font-size: 14px;">Upload and sign your first document to get started!</p>
            </div>
        `;
        return;
    }

    // Display user's documents
    console.log('Creating document cards for', userDetails.documents.length, 'documents');
    userDetails.documents.forEach((doc, index) => {
        console.log('Creating card', index + 1, 'for document:', doc.name);
        const docCard = createDocumentCard(doc);
        documentsGrid.appendChild(docCard);
    });
    
    console.log('All document cards appended. Total children:', documentsGrid.children.length);
}


function createDocumentCard(doc) {
    const card = document.createElement('div');
    card.className = 'document-card';
    
    const statusClass = doc.signed ? 'signed' : 'pending';
    const statusText = doc.signed ? 'Signed' : 'Pending Signature';
    
    // Store doc.id in a data attribute to avoid quote escaping issues
    card.setAttribute('data-doc-id', doc.id);
    
    card.innerHTML = `
        <div class="doc-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
        </div>
        <div class="doc-info">
            <h4>${doc.name}</h4>
            <p class="doc-meta">${doc.signed ? 'Signed on' : 'Uploaded on'}: ${doc.date}</p>
            <p class="doc-meta">Size: ${doc.size}</p>
            ${doc.signed ? `<p class="doc-meta">Reason: ${doc.signatureReason || 'N/A'}</p>` : ''}
            <span class="status-badge ${statusClass}">${statusText}</span>
        </div>
        <div class="doc-actions">
            ${doc.signed ? 
                '<button class="btn btn-sm btn-download">Download</button>' :
                '<button class="btn btn-sm btn-primary btn-sign">Sign Now</button>'
            }
            <button class="btn btn-sm btn-secondary btn-details">Details</button>
            <button class="btn btn-sm btn-danger btn-delete">Delete</button>
        </div>
    `;
    
    // Add event listeners instead of inline onclick
    const docId = doc.id;
    
    if (doc.signed) {
        const downloadBtn = card.querySelector('.btn-download');
        if (downloadBtn) {
            downloadBtn.addEventListener('click', () => downloadDocument(docId));
        }
    } else {
        const signBtn = card.querySelector('.btn-sign');
        if (signBtn) {
            signBtn.addEventListener('click', () => signDocumentFromList(docId));
        }
    }
    
    const detailsBtn = card.querySelector('.btn-details');
    if (detailsBtn) {
        detailsBtn.addEventListener('click', () => viewDocumentDetails(docId));
    }
    
    const deleteBtn = card.querySelector('.btn-delete');
    if (deleteBtn) {
        deleteBtn.addEventListener('click', () => deleteDocument(docId));
    }
    
    return card;
}

function loadAdminData() {
    loadAdminStats();
    loadAdminUsers();
    loadAdminAuditLogs();
}

function loadAdminStats() {
    const stats = authManager.getSystemStats();
    
    // Update stats cards
    const statCards = document.querySelectorAll('#adminOverviewTab .stat-card');
    if (statCards.length >= 4) {
        statCards[0].querySelector('.stat-number').textContent = stats.totalUsers;
        statCards[1].querySelector('.stat-number').textContent = stats.activeCertificates;
        statCards[2].querySelector('.stat-number').textContent = stats.totalDocuments;
    }
}

function loadAdminUsers() {
    const users = authManager.getAllUsersForAdmin();
    const tbody = document.querySelector('#adminUsersTab tbody');
    
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    users.forEach(user => {
        const row = document.createElement('tr');
        const regDate = new Date(user.registeredDate).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
        
        row.innerHTML = `
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td>${user.organization || 'N/A'}</td>
            <td><span class="status-badge ${user.certificate.status === 'Active' ? 'valid' : 'revoked'}">${user.certificate.status}</span></td>
            <td>${regDate}</td>
            <td>
                <button class="btn btn-sm" onclick="viewUserDetails('${user.email}')">View</button>
                <button class="btn btn-sm btn-secondary" onclick="editUser('${user.email}')">Edit</button>
            </td>
        `;
        
        tbody.appendChild(row);
    });
}

function loadAdminAuditLogs() {
    const logs = authManager.getAuditLogs(20);
    const tbody = document.querySelector('#adminAuditTab tbody');
    
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    logs.forEach(log => {
        const row = document.createElement('tr');
        const timestamp = new Date(log.timestamp).toLocaleString('en-US');
        
        row.innerHTML = `
            <td>${timestamp}</td>
            <td>${log.eventType}</td>
            <td>${log.user}</td>
            <td>${log.action}</td>
            <td>${log.ipAddress}</td>
            <td><span class="status-badge ${log.status === 'Success' ? 'valid' : 'error'}">${log.status}</span></td>
        `;
        
        tbody.appendChild(row);
    });
}

// ==========================================
// TAB SWITCHING
// ==========================================

function switchTab(clickedTab, dashboardType) {
    const dashboard = dashboardType === 'user' ? '#userDashboard' : '#adminDashboard';
    
    // Update menu items
    document.querySelectorAll(`${dashboard} .menu-item`).forEach(item => {
        item.classList.remove('active');
    });
    clickedTab.classList.add('active');

    // Update tab content
    const tabName = clickedTab.getAttribute('data-tab');
    
    // FIX: Build the correct tab ID
    let tabId;
    if (tabName.startsWith('admin-')) {
        // For admin tabs like 'admin-overview' -> 'adminOverviewTab'
        const parts = tabName.split('-');
        tabId = parts[0] + parts[1].charAt(0).toUpperCase() + parts[1].slice(1) + 'Tab';
    } else {
        // For user tabs like 'documents' -> 'documentsTab'
        tabId = tabName + 'Tab';
    }

    console.log('Switching to tab:', tabName, '-> ID:', tabId); // Debug log

    // Hide all tabs
    document.querySelectorAll(`${dashboard} .tab-content`).forEach(content => {
        content.classList.remove('active');
    });

    // Show the target tab
    const targetTab = document.getElementById(tabId);
    if (targetTab) {
        targetTab.classList.add('active');
        console.log('Tab activated:', tabId);
    } else {
        console.error('Tab not found:', tabId);
    }

    // Reload data when switching to certain tabs
    if (dashboardType === 'admin') {
        if (tabName === 'admin-users') {
            loadAdminUsers();
        } else if (tabName === 'admin-audit') {
            loadAdminAuditLogs();
        }
    } else if (dashboardType === 'user') {
        if (tabName === 'documents') {
            // Use async version
            loadUserData(); // This will reload documents from IndexedDB
        }
    }
}

// ==========================================
// FILE HANDLING WITH STORAGE
// ==========================================

let currentFile = null;
let currentFileData = null;

function handleFileSelect(file) {
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    
    if (!allowedTypes.includes(file.type)) {
        showNotification('Please upload a PDF, DOC, or DOCX file', 'error');
        return;
    }

    // Check file size (max 2MB for localStorage limitations - reduced from 5MB)
    if (file.size > 2 * 1024 * 1024) {
        showNotification('File size must be less than 2MB for localStorage compatibility', 'error');
        return;
    }

    currentFile = file;

    // Convert file to base64 for storage
    const reader = new FileReader();
    reader.onload = function(e) {
        currentFileData = e.target.result;
        console.log('File loaded, size:', currentFileData.length, 'characters');
    };
    reader.onerror = function(e) {
        console.error('Error reading file:', e);
        showNotification('Error reading file', 'error');
    };
    reader.readAsDataURL(file);

    // Show file preview
    document.getElementById('uploadArea').style.display = 'none';
    document.getElementById('filePreview').style.display = 'block';
    
    // Update file info
    document.getElementById('fileName').textContent = file.name;
    document.getElementById('fileSize').textContent = formatFileSize(file.size);
}

async function handleSignDocument() {
    if (!currentFile || !currentFileData) {
        showNotification('No file selected or file not fully loaded', 'error');
        return;
    }

    const reason = document.getElementById('signatureReason').value.trim();
    const location = document.getElementById('signatureLocation').value.trim();

    if (!reason || !location) {
        showNotification('Please fill in all signing details', 'error');
        return;
    }

    showNotification('Hashing document...', 'info');
    
    try {
        // STEP 1: Generate document hash
        const documentHash = await cryptoUtils.hashDocument(currentFileData);
        console.log('Document hash generated:', documentHash);
        
        showNotification('Signing document with your private key...', 'info');
        
        // STEP 2: Get user's private key
        const userDetails = authManager.getUserDetails(currentUser.email);
        if (!userDetails.keys || !userDetails.keys.privateKey) {
            showNotification('Error: User keys not found. Please contact administrator.', 'error');
            return;
        }
        
        // STEP 3: Sign the document hash
        const signature = await cryptoUtils.signHash(documentHash, userDetails.keys.privateKey);
        console.log('Document signed successfully');
        
        // STEP 4: Create signed document with cryptographic proof
        const signedDocument = {
            id: generateDocumentId(),
            name: currentFile.name,
            size: formatFileSize(currentFile.size),
            type: currentFile.type,
            fileData: currentFileData,
            date: new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            }),
            timestamp: new Date().toISOString(),
            signed: true,
            signatureReason: reason,
            signatureLocation: location,
            signedBy: currentUser.name,
            signedEmail: currentUser.email,
            // Add cryptographic signature data
            cryptoSignature: {
                documentHash: documentHash,
                signature: signature,
                algorithm: 'RSASSA-PKCS1-v1_5',
                hashAlgorithm: 'SHA-256',
                publicKeyFingerprint: userDetails.keys.fingerprint,
                signedAt: cryptoUtils.getTimestamp()
            }
        };

        // Save to IndexedDB
        await documentStorage.saveDocument(currentUser.email, signedDocument);

        authManager.logAuditEvent(
            'DOCUMENT_SIGNED',
            currentUser.email,
            `Cryptographically signed document: ${currentFile.name} (Hash: ${documentHash.substring(0, 16)}...)`
        );

        showNotification('Document signed successfully with cryptographic signature!', 'success');
        
        // Reset upload area
        document.getElementById('uploadArea').style.display = 'block';
        document.getElementById('filePreview').style.display = 'none';
        document.getElementById('fileInput').value = '';
        document.getElementById('signatureReason').value = '';
        document.getElementById('signatureLocation').value = '';
        currentFile = null;
        currentFileData = null;
        
        // Reload user data
        await loadUserData();
        
        // Switch to documents tab
        const documentsTab = document.querySelector('[data-tab="documents"]');
        if (documentsTab) {
            switchTab(documentsTab, 'user');
        }
        
    } catch (error) {
        console.error('Error in handleSignDocument:', error);
        showNotification('Error signing document: ' + error.message, 'error');
    }
}

async function handleVerifyDocument(file) {
    showNotification('Reading document...', 'info');
    
    try {
        // Read the uploaded file
        const reader = new FileReader();
        
        reader.onload = async function(e) {
            const uploadedFileData = e.target.result;
            
            showNotification('Verifying cryptographic signature...', 'info');
            
            try {
                // Search for this document in IndexedDB by matching file data
                const allDocs = await documentStorage.getUserDocuments(currentUser.email);
                
                // Find matching document by comparing hashes
                const uploadedHash = await cryptoUtils.hashDocument(uploadedFileData);
                const matchingDoc = allDocs.find(doc => 
                    doc.cryptoSignature && doc.cryptoSignature.documentHash === uploadedHash
                );
                
                if (!matchingDoc) {
                    // Document not found in database
                    showVerificationResult(false, {
                        error: 'Document not found in system or has been modified'
                    });
                    return;
                }
                
                if (!matchingDoc.signed || !matchingDoc.cryptoSignature) {
                    showVerificationResult(false, {
                        error: 'Document has no cryptographic signature'
                    });
                    return;
                }
                
                // Get signer's public key
                const signerDetails = authManager.getUserDetails(matchingDoc.signedEmail);
                if (!signerDetails || !signerDetails.keys) {
                    showVerificationResult(false, {
                        error: 'Signer public key not found'
                    });
                    return;
                }
                
                // Verify the signature
                const isValid = await cryptoUtils.verifySignature(
                    matchingDoc.cryptoSignature.documentHash,
                    matchingDoc.cryptoSignature.signature,
                    signerDetails.keys.publicKey
                );
                
                if (isValid) {
                    showVerificationResult(true, {
                        signedBy: matchingDoc.signedBy,
                        signedEmail: matchingDoc.signedEmail,
                        signedAt: matchingDoc.cryptoSignature.signedAt,
                        documentHash: matchingDoc.cryptoSignature.documentHash,
                        fingerprint: matchingDoc.cryptoSignature.publicKeyFingerprint,
                        algorithm: matchingDoc.cryptoSignature.algorithm,
                        reason: matchingDoc.signatureReason,
                        location: matchingDoc.signatureLocation
                    });
                } else {
                    showVerificationResult(false, {
                        error: 'Signature verification failed - document may have been tampered with'
                    });
                }
                
            } catch (error) {
                console.error('Verification error:', error);
                showVerificationResult(false, {
                    error: 'Verification failed: ' + error.message
                });
            }
        };
        
        reader.onerror = function() {
            showNotification('Error reading file', 'error');
        };
        
        reader.readAsDataURL(file);
        
    } catch (error) {
        console.error('Error in handleVerifyDocument:', error);
        showNotification('Error: ' + error.message, 'error');
    }
}

function showVerificationResult(isValid, data) {
    const resultDiv = document.getElementById('verificationResult');
    const resultCard = resultDiv.querySelector('.result-card');
    
    // Update result card class
    resultCard.className = 'result-card ' + (isValid ? 'success' : 'error');
    
    // Update icon and title
    const icon = resultCard.querySelector('.result-icon svg');
    const title = resultCard.querySelector('h3');
    const description = resultCard.querySelector('p');
    
    if (isValid) {
        icon.innerHTML = '<path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>';
        title.textContent = 'Signature Valid ✓';
        description.textContent = 'This document has a valid cryptographic signature';
    } else {
        icon.innerHTML = '<path d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/>';
        title.textContent = 'Signature Invalid ✗';
        description.textContent = data.error || 'Signature verification failed';
    }
    
    // Update details
    const detailsDiv = resultCard.querySelector('.verification-details');
    if (isValid) {
        detailsDiv.innerHTML = `
            <div class="detail-item">
                <strong>Signed By:</strong>
                <span>${data.signedBy} (${data.signedEmail})</span>
            </div>
            <div class="detail-item">
                <strong>Signed On:</strong>
                <span>${new Date(data.signedAt).toLocaleString()}</span>
            </div>
            <div class="detail-item">
                <strong>Signature Reason:</strong>
                <span>${data.reason}</span>
            </div>
            <div class="detail-item">
                <strong>Signature Location:</strong>
                <span>${data.location}</span>
            </div>
            <div class="detail-item">
                <strong>Document Hash (SHA-256):</strong>
                <span class="hash-text">${data.documentHash.substring(0, 32)}...</span>
            </div>
            <div class="detail-item">
                <strong>Signature Algorithm:</strong>
                <span>${data.algorithm}</span>
            </div>
            <div class="detail-item">
                <strong>Public Key Fingerprint:</strong>
                <span class="hash-text">${data.fingerprint.substring(0, 47)}...</span>
            </div>
            <div class="detail-item">
                <strong>Document Integrity:</strong>
                <span class="status-text success">✓ Not Modified</span>
            </div>
            <div class="detail-item">
                <strong>Signature Status:</strong>
                <span class="status-text success">✓ Cryptographically Valid</span>
            </div>
        `;
    } else {
        detailsDiv.innerHTML = `
            <div class="detail-item">
                <strong>Error:</strong>
                <span class="status-text error">${data.error}</span>
            </div>
        `;
    }
    
    resultDiv.style.display = 'block';
    
    showNotification(
        isValid ? 'Document verified successfully!' : 'Signature verification failed',
        isValid ? 'success' : 'error'
    );
}

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

function generateDocumentId() {
    return 'doc_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Style the notification
    notification.style.position = 'fixed';
    notification.style.top = '20px';
    notification.style.right = '20px';
    notification.style.padding = '16px 24px';
    notification.style.borderRadius = '8px';
    notification.style.color = 'white';
    notification.style.fontWeight = '500';
    notification.style.zIndex = '10000';
    notification.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
    notification.style.animation = 'slideIn 0.3s ease-out';
    notification.style.maxWidth = '400px';
    
    switch(type) {
        case 'success':
            notification.style.background = '#10B981';
            break;
        case 'error':
            notification.style.background = '#EF4444';
            break;
        case 'info':
            notification.style.background = '#3B82F6';
            break;
        default:
            notification.style.background = '#6B7280';
    }

    document.body.appendChild(notification);

    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => {
            if (notification.parentNode) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// ==========================================
// DOCUMENT ACTIONS
// ==========================================

async function downloadDocument(docId) {
    try {
        const doc = await documentStorage.getDocument(docId);
        
        if (!doc || !doc.fileData) {
            showNotification('Document not found or no file data available', 'error');
            return;
        }
        
        // Create a download link
        const link = document.createElement('a');
        link.href = doc.fileData;
        link.download = doc.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showNotification('Document downloaded successfully', 'success');
    } catch (error) {
        console.error('Error downloading document:', error);
        showNotification('Error downloading document', 'error');
    }
}

async function deleteDocument(docId) {
    // Show confirmation dialog
    if (!confirm('Are you sure you want to delete this document? This action cannot be undone.')) {
        return;
    }
    
    try {
        showNotification('Deleting document...', 'info');
        
        // Delete from IndexedDB
        const deleted = await documentStorage.deleteDocument(docId);
        
        if (deleted) {
            // Log audit event
            authManager.logAuditEvent(
                'DOCUMENT_DELETED',
                currentUser.email,
                `Deleted document: ${docId}`
            );
            
            showNotification('Document deleted successfully!', 'success');
            
            // Reload documents to refresh the view
            await loadUserData();
        } else {
            showNotification('Document not found', 'error');
        }
        
    } catch (error) {
        console.error('Error deleting document:', error);
        showNotification('Error deleting document: ' + error.message, 'error');
    }
}

async function viewDocumentDetails(docId) {
    try {
        const doc = await documentStorage.getDocument(docId);
        
        if (!doc) {
            showNotification('Document not found', 'error');
            return;
        }
        
        const details = `
Document: ${doc.name}
Size: ${doc.size}
Signed: ${doc.signed ? 'Yes' : 'No'}
${doc.signed ? `Signed By: ${doc.signedBy}
Signature Reason: ${doc.signatureReason}
Signature Location: ${doc.signatureLocation}
Signed On: ${doc.date}` : ''}
        `.trim();
        
        alert(details);
    } catch (error) {
        console.error('Error viewing document details:', error);
        showNotification('Error loading document details', 'error');
    }
}

function signDocumentFromList(docId) {
    const uploadTab = document.querySelector('[data-tab="upload"]');
    if (uploadTab) {
        switchTab(uploadTab, 'user');
        showNotification('Please upload the document to sign', 'info');
    }
}

// Admin functions (called from HTML onclick handlers)
function viewUserDetails(email) {
    const user = authManager.getUserDetails(email);
    if (user) {
        const docCount = user.documents ? user.documents.length : 0;
        alert(`User Details:
        
Name: ${user.name}
Email: ${email}
Organization: ${user.organization || 'N/A'}
Role: ${user.role}
Registered: ${new Date(user.registeredDate).toLocaleDateString()}

Certificate:
Serial: ${user.certificate.serial}
Status: ${user.certificate.status}
Valid Until: ${user.certificate.expiry}

Documents: ${docCount} signed document(s)`);
    }
}

function editUser(email) {
    showNotification('Edit user feature - coming soon!', 'info');
}

// Add animation styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);