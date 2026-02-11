// Test credentials
const TEST_USERS = {
    'admin@securesign.com': {
        password: 'admin123',
        role: 'admin',
        name: 'Administrator'
    },
    'user@securesign.com': {
        password: 'user123',
        role: 'user',
        name: 'John Doe'
    }
};

// Current session
let currentUser = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initializeEventListeners();
    showScreen('loginScreen');
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
        uploadArea.style.borderColor = 'var(--primary-color)';
        uploadArea.style.background = '#F5F3FF';
    });

    uploadArea.addEventListener('dragleave', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = 'var(--border-color)';
        uploadArea.style.background = 'var(--card-bg)';
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
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
        verifyUploadArea.style.borderColor = 'var(--primary-color)';
        verifyUploadArea.style.background = '#F5F3FF';
    });

    verifyUploadArea.addEventListener('dragleave', (e) => {
        e.preventDefault();
        verifyUploadArea.style.borderColor = 'var(--border-color)';
        verifyUploadArea.style.background = 'var(--card-bg)';
    });

    verifyUploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
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

// Authentication handlers
function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    if (TEST_USERS[email] && TEST_USERS[email].password === password) {
        currentUser = {
            email: email,
            role: TEST_USERS[email].role,
            name: TEST_USERS[email].name
        };

        if (currentUser.role === 'admin') {
            document.getElementById('adminName').textContent = currentUser.name;
            showScreen('adminDashboard');
        } else {
            document.getElementById('userName').textContent = currentUser.name;
            showScreen('userDashboard');
        }

        // Reset form
        document.getElementById('loginForm').reset();
        showNotification('Login successful!', 'success');
    } else {
        showNotification('Invalid email or password', 'error');
    }
}

function handleRegister(e) {
    e.preventDefault();

    const fullName = document.getElementById('regFullName').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    const confirmPassword = document.getElementById('regConfirmPassword').value;

    if (password !== confirmPassword) {
        showNotification('Passwords do not match', 'error');
        return;
    }

    // Simulate registration
    showNotification('Registration successful! Please login with your credentials.', 'success');
    document.getElementById('registerForm').reset();
    showScreen('loginScreen');
}

function handleLogout() {
    currentUser = null;
    showScreen('loginScreen');
    showNotification('Logged out successfully', 'success');
}

// Tab switching
function switchTab(clickedTab, dashboardType) {
    const dashboard = dashboardType === 'user' ? '#userDashboard' : '#adminDashboard';
    
    // Update menu items
    document.querySelectorAll(`${dashboard} .menu-item`).forEach(item => {
        item.classList.remove('active');
    });
    clickedTab.classList.add('active');

    // Update tab content
    const tabName = clickedTab.getAttribute('data-tab');
    const prefix = dashboardType === 'user' ? '' : 'admin';
    const tabId = tabName.charAt(0).toUpperCase() + tabName.slice(1) + 'Tab';

    document.querySelectorAll(`${dashboard} .tab-content`).forEach(content => {
        content.classList.remove('active');
    });

    const targetTab = document.getElementById(tabId);
    if (targetTab) {
        targetTab.classList.add('active');
    }
}

// File handling
function handleFileSelect(file) {
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    
    if (!allowedTypes.includes(file.type)) {
        showNotification('Please upload a PDF, DOC, or DOCX file', 'error');
        return;
    }

    // Show file preview
    document.getElementById('uploadArea').style.display = 'none';
    document.getElementById('filePreview').style.display = 'block';
    
    // Update file info
    document.getElementById('fileName').textContent = file.name;
    document.getElementById('fileSize').textContent = formatFileSize(file.size);
}

function handleSignDocument() {
    const reason = document.getElementById('signatureReason').value;
    const location = document.getElementById('signatureLocation').value;

    if (!reason || !location) {
        showNotification('Please fill in all signing details', 'error');
        return;
    }

    // Simulate signing process
    showNotification('Document signing in progress...', 'info');
    
    setTimeout(() => {
        showNotification('Document signed successfully!', 'success');
        
        // Reset upload area
        document.getElementById('uploadArea').style.display = 'block';
        document.getElementById('filePreview').style.display = 'none';
        document.getElementById('fileInput').value = '';
        document.getElementById('signatureReason').value = '';
        document.getElementById('signatureLocation').value = '';
        
        // Switch to documents tab
        const documentsTab = document.querySelector('[data-tab="documents"]');
        if (documentsTab) {
            switchTab(documentsTab, 'user');
        }
    }, 2000);
}

function handleVerifyDocument(file) {
    showNotification('Verifying document signature...', 'info');
    
    // Simulate verification
    setTimeout(() => {
        document.getElementById('verificationResult').style.display = 'block';
        showNotification('Document verified successfully!', 'success');
    }, 1500);
}

// Utilities
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
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
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
