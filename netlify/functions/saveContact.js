/**
 * saveContact.js — Netlify Serverless Function (Enhanced Security)
 * Accepts a JSON POST from the contact form and appends the submission
 * to frontend/data/contact_submissions.json in the GitHub repository
 * using the GitHub Contents API.
 *
 * Required Environment Variables (set in Netlify dashboard):
 *   GITHUB_TOKEN        — Personal Access Token with `contents:write` scope
 *   GITHUB_REPO_OWNER   — e.g. "ar-abhinavranjan"
 *   GITHUB_REPO_NAME    — e.g. "abhinavranjan"
 *   GITHUB_BRANCH       — e.g. "main" (defaults to "main")
 */

const FILE_PATH = 'frontend/data/contact_submissions.json';

/**
 * Validates required fields on the incoming payload.
 */
function validatePayload(body) {
    const required = ['name', 'email', 'message'];
    for (const field of required) {
        if (!body[field] || String(body[field]).trim() === '') {
            return `Missing required field: ${field}`;
        }
    }
    
    // Validate name length
    if (body.name.trim().length < 2 || body.name.length > 100) {
        return 'Name must be between 2 and 100 characters';
    }
    
    // Email format check
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
        return 'Invalid email address';
    }
    
    // Phone validation (if provided)
    if (body.contactNo && !/^[+]?[0-9]{1,15}$/.test(body.contactNo)) {
        return 'Invalid phone number format';
    }
    
    // Message length validation
    if (body.message.trim().length < 10 || body.message.length > 2000) {
        return 'Message must be between 10 and 2000 characters';
    }
    
    return null;
}

/**
 * Sanitises a single string value to prevent injection.
 */
function sanitise(value) {
    if (typeof value !== 'string') return '';
    return value.trim().slice(0, 2000).replace(/[<>"']/g, (char) => {
        const map = { '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
        return map[char];
    });
}

exports.handler = async (event) => {
    // Only allow POST
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ result: 'error', error: 'Method Not Allowed' })
        };
    }

    // Rate limiting: max 5 requests per minute per IP
    const RATE_LIMIT = 5;
    const WINDOW_MS = 60 * 1000;
    if (!global.rateLimiter) {
        global.rateLimiter = new Map(); // ip => { count, resetTime }
    }
    const ip = event.headers['x-forwarded-for'] || 'unknown';
    const now = Date.now();
    const entry = global.rateLimiter.get(ip) || { count: 0, resetTime: now + WINDOW_MS };
    if (now > entry.resetTime) {
        entry.count = 0;
        entry.resetTime = now + WINDOW_MS;
    }
    entry.count += 1;
    global.rateLimiter.set(ip, entry);
    if (entry.count > RATE_LIMIT) {
        return {
            statusCode: 429,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ result: 'error', error: 'Too many requests. Please try again later.' })
        };
    }

    // Parse body
    let body;
    try {
        body = JSON.parse(event.body || '{}');
    } catch {
        return {
            statusCode: 400,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ result: 'error', error: 'Invalid request format' })
        };
    }

    // Validate
    const validationError = validatePayload(body);
    if (validationError) {
        return {
            statusCode: 422,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ result: 'error', error: validationError })
        };
    }

    // Build the new submission record
    const submission = {
        id: `sub_${Date.now()}`,
        timestamp: new Date().toISOString(),
        name: sanitise(body.name),
        email: sanitise(body.email),
        contactNo: sanitise(body.contactNo || ''),
        message: sanitise(body.message),
        department: sanitise(body.department) || 'General Inquiry',
        source_ip: ip
    };

    // ── GitHub API config ──────────────────────────────────────────────────────
    const token = process.env.GITHUB_TOKEN;
    const owner = process.env.GITHUB_REPO_OWNER;
    const repo  = process.env.GITHUB_REPO_NAME;
    const branch = process.env.GITHUB_BRANCH || 'main';

    if (!token || !owner || !repo) {
        console.error('Server configuration incomplete');
        return {
            statusCode: 500,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ result: 'error', error: 'Internal server error. Please try again later.' })
        };
    }

    const apiBase = `https://api.github.com/repos/${owner}/${repo}/contents/${FILE_PATH}`;
    const headers = {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        'User-Agent': 'abhinavranjan-contact-function/1.0'
    };

    try {
        // 1. Fetch the current file (to get its SHA and content)
        let currentSubmissions = [];
        let fileSha = null;

        const getResponse = await fetch(`${apiBase}?ref=${branch}`, { headers });

        if (getResponse.ok) {
            const fileData = await getResponse.json();
            fileSha = fileData.sha;
            // GitHub returns base64-encoded content
            const decoded = Buffer.from(fileData.content, 'base64').toString('utf-8');
            try {
                currentSubmissions = JSON.parse(decoded);
                if (!Array.isArray(currentSubmissions)) currentSubmissions = [];
            } catch {
                currentSubmissions = [];
            }
        } else if (getResponse.status !== 404) {
            throw new Error(`GitHub API error: ${getResponse.status}`);
        }

        // Limit submissions to last 1000 to prevent file bloat
        if (currentSubmissions.length > 1000) {
            currentSubmissions = currentSubmissions.slice(-1000);
        }

        // 2. Append the new submission
        currentSubmissions.push(submission);

        // 3. Encode updated content and commit back
        const updatedContent = Buffer.from(
            JSON.stringify(currentSubmissions, null, 2)
        ).toString('base64');

        const commitPayload = {
            message: `chore: add contact submission [${submission.id}]`,
            content: updatedContent,
            branch
        };
        if (fileSha) commitPayload.sha = fileSha; // required for updates

        const putResponse = await fetch(apiBase, {
            method: 'PUT',
            headers,
            body: JSON.stringify(commitPayload)
        });

        if (!putResponse.ok) {
            throw new Error(`GitHub API error: ${putResponse.status}`);
        }

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': 'https://abhinavranjan.qzz.io',
                'Access-Control-Allow-Methods': 'POST',
                'Access-Control-Allow-Headers': 'Content-Type, X-CSRF-Token'
            },
            body: JSON.stringify({
                result: 'success',
                id: submission.id,
                message: 'Thank you! Your message has been received.'
            })
        };

    } catch (err) {
        console.error('Processing error');
        return {
            statusCode: 500,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ result: 'error', error: 'Failed to process your request. Please try again.' })
        };
    }
};
