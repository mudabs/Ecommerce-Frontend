// Debug utility for authentication troubleshooting
// Use this in browser console to diagnose auth issues

const isLocalHost = ['localhost', '127.0.0.1'].includes(window.location.hostname);
const localApiBaseUrl = `${window.location.protocol}//${window.location.hostname}:8081`;
const API_BASE_URL = (isLocalHost
    ? localApiBaseUrl
    : 'https://api.smartcart.munashemudabura.com').replace(/\/$/, '');

const authDebugger = {
    // Check current auth state
    checkAuthState() {
        console.log('=== Authentication State Debug ===');
        
        const authData = localStorage.getItem('auth');
        console.log('localStorage auth:', authData ? JSON.parse(authData) : 'None');
        
        const cartItems = localStorage.getItem('cartItems');
        console.log('localStorage cartItems:', cartItems ? JSON.parse(cartItems) : 'None');
        
        const checkoutAddress = localStorage.getItem('CHECKOUT_ADDRESS');
        console.log('localStorage CHECKOUT_ADDRESS:', checkoutAddress ? JSON.parse(checkoutAddress) : 'None');
        
        // Check cookies
        const cookies = document.cookie.split(';').reduce((acc, cookie) => {
            const [name, value] = cookie.trim().split('=');
            acc[name] = value;
            return acc;
        }, {});
        console.log('Cookies:', cookies);
        
        console.log('Current URL:', window.location.href);
        console.log('===============================');
    },
    
    // Test API connectivity
    async testAPI() {
        console.log('=== API Connectivity Test ===');
        console.log('API base URL:', API_BASE_URL);
        
        try {
            const response = await fetch(`${API_BASE_URL}/api/public/categories`);
            console.log('Public API status:', response.status);
            if (response.ok) {
                const data = await response.json();
                console.log('Public API response:', data);
            }
        } catch (error) {
            console.error('Public API error:', error);
        }
        
        // Test auth endpoint if user is logged in
        const authData = localStorage.getItem('auth');
        if (authData) {
            try {
                const parsedAuth = JSON.parse(authData);
                const token = parsedAuth?.jwtToken || parsedAuth?.token;
                
                const authResponse = await fetch(`${API_BASE_URL}/api/auth/user`, {
                    method: 'GET',
                    credentials: 'include',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                
                console.log('Auth API status:', authResponse.status);
                if (authResponse.ok) {
                    const userData = await authResponse.json();
                    console.log('Auth API response:', userData);
                } else {
                    console.error('Auth API error:', await authResponse.text());
                }
            } catch (error) {
                console.error('Auth API test error:', error);
            }
        }
        
        console.log('============================');
    },
    
    // Clear all auth data
    clearAuth() {
        console.log('Clearing all authentication data...');
        localStorage.removeItem('auth');
        localStorage.removeItem('cartItems');
        localStorage.removeItem('CHECKOUT_ADDRESS');
        
        // Clear cookies
        document.cookie.split(";").forEach(function(c) { 
            document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
        });
        
        console.log('Auth data cleared. Please refresh the page.');
    },
    
    // Monitor token expiration
    monitorToken() {
        const authData = localStorage.getItem('auth');
        if (!authData) {
            console.log('No auth token found');
            return;
        }
        
        try {
            const parsedAuth = JSON.parse(authData);
            const token = parsedAuth?.jwtToken || parsedAuth?.token;
            
            if (token) {
                // Decode JWT token (simple base64 decode, not secure validation)
                const parts = token.split('.');
                if (parts.length === 3) {
                    const payload = JSON.parse(atob(parts[1]));
                    const exp = payload.exp * 1000; // Convert to milliseconds
                    const now = Date.now();
                    const timeLeft = exp - now;
                    
                    console.log('Token expiration:', new Date(exp));
                    console.log('Time left:', Math.floor(timeLeft / 1000 / 60), 'minutes');
                    console.log('Token valid:', timeLeft > 0);
                } else {
                    console.log('Invalid token format');
                }
            }
        } catch (error) {
            console.error('Error parsing token:', error);
        }
    }
};

// Make it globally available
window.authDebugger = authDebugger;

console.log('Auth debugger loaded. Use: authDebugger.checkAuthState(), authDebugger.testAPI(), authDebugger.clearAuth(), authDebugger.monitorToken()');
