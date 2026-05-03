/**
 * AUTH GUARD - AR DEVEND
 * Prevents unauthorized access to administrative pages.
 */
(function() {
    const token = sessionStorage.getItem('dev_access_token');
    
    if (!token) {
        console.warn('Unauthorized access attempt. Redirecting to login...');
        window.location.href = '../login.html';
        return;
    }

    // Optional: Validate token format or expiry (very basic check)
    try {
        const decoded = atob(token);
        if (!decoded.includes(':')) {
            throw new Error('Invalid token');
        }
    } catch (e) {
        sessionStorage.removeItem('dev_access_token');
        window.location.href = '../login.html';
    }
})();
