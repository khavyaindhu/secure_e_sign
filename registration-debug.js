// ==========================================
// REGISTRATION DIAGNOSTIC SCRIPT
// Add this temporarily to debug registration issues
// ==========================================

// Override the handleRegister function with detailed logging
function handleRegister(e) {
    e.preventDefault();

    console.log('=== REGISTRATION DEBUG START ===');

    const fullName = document.getElementById('regFullName').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const organization = document.getElementById('regOrganization').value.trim();
    const password = document.getElementById('regPassword').value;
    const confirmPassword = document.getElementById('regConfirmPassword').value;

    console.log('Form values:', { fullName, email, organization, passwordLength: password.length });

    // Validate inputs
    if (!fullName || !email || !password || !confirmPassword) {
        console.error('Validation failed: Empty fields');
        showNotification('Please fill in all required fields', 'error');
        return;
    }

    if (password !== confirmPassword) {
        console.error('Validation failed: Passwords do not match');
        showNotification('Passwords do not match', 'error');
        return;
    }

    console.log('Validation passed, checking cryptoUtils...');
    console.log('cryptoUtils available:', typeof cryptoUtils !== 'undefined');
    console.log('authManager available:', typeof authManager !== 'undefined');

    // Call register with async handling
    console.log('Calling authManager.register...');
    
    authManager.register(email, password, fullName, organization)
        .then(result => {
            console.log('Registration result:', result);
            
            if (result.success) {
                showNotification(result.message, 'success');
                document.getElementById('registerForm').reset();
                
                setTimeout(() => {
                    showScreen('loginScreen');
                    document.getElementById('loginEmail').value = email;
                }, 1500);
            } else {
                console.error('Registration failed:', result.message);
                showNotification(result.message, 'error');
            }
            
            console.log('=== REGISTRATION DEBUG END ===');
        })
        .catch(error => {
            console.error('Registration error (catch block):', error);
            console.error('Error stack:', error.stack);
            showNotification('Registration failed: ' + error.message, 'error');
            console.log('=== REGISTRATION DEBUG END ===');
        });
}

// Test crypto availability immediately on page load
document.addEventListener('DOMContentLoaded', () => {
    console.log('=== CRYPTO MODULE CHECK ===');
    console.log('cryptoUtils defined:', typeof cryptoUtils !== 'undefined');
    console.log('authManager defined:', typeof authManager !== 'undefined');
    console.log('Web Crypto API available:', typeof window.crypto !== 'undefined');
    
    if (typeof cryptoUtils !== 'undefined') {
        console.log('✓ cryptoUtils loaded successfully');
        
        // Quick test
        cryptoUtils.hashDocument('test')
            .then(hash => {
                console.log('✓ Crypto module working! Test hash:', hash.substring(0, 20) + '...');
            })
            .catch(err => {
                console.error('✗ Crypto module error:', err);
            });
    } else {
        console.error('✗ cryptoUtils NOT loaded!');
        console.error('Check that crypto-utils.js is loaded BEFORE auth.js in your HTML');
    }
    console.log('=== END CRYPTO MODULE CHECK ===');
});