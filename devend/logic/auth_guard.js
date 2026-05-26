/**
 * AUTH GUARD - AR DEVEND
 * Prevents unauthorized access to administrative pages.
 */
(function() {
(function() {
    // Retrieve auth token from cookies (non-HttpOnly)
    const getCookie = name => {
        const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
        return match ? decodeURIComponent(match[1]) : null;
    };
    const token = getCookie('dev_access_token');
    if (!token) {
        console.warn('Unauthorized access attempt. Redirecting to login...');
        window.location.href = '../login.html';
        return;
    }
    // Optional: simple validation of token format (uid:timestamp)
    if (!/^[^:]+:\d+$/.test(token)) {
        console.warn('Invalid token format. Redirecting to login...');
        window.location.href = '../login.html';
        return;
    }
})();
})();
