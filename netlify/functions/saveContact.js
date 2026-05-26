/**
 * saveContact.js — Netlify Serverless Function
 * Accepts a JSON POST from the contact form and appends the submission
 * to frontend/data/contact_submissions.json in the GitHub repository
 * using the GitHub Contents API.
 *
 * Required Environment Variables (set in Netlify dashboard):
 *   GITHUB_TOKEN        — Personal Access Token with `contents:write` scope
 *   GITHUB_REPO_OWNER   — e.g. "ar-abhinavranjan"
 *   GITHUB_REPO_NAME    — e.g. "abhinavranjan-main"
 *   GITHUB_BRANCH       — e.g. "main" (defaults to "main")
 *   CONTACT_SECRET      — Optional shared secret for basic auth (can be empty)
 *   CONTACT_TOKEN       — Optional token for Bearer authentication (can be empty)
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
    // Basic email format check
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
        return 'Invalid email address';
    }
    return null;
}

/**
 * Sanitises a single string value to prevent injection.
 */
function sanitise(value) {
    if (typeof value !== 'string') return '';
    return value.trim().slice(0, 2000);
}

exports.handler = async (event) => {
    // Only allow POST
    // Simple rate limiting: max 5 requests per minute per IP
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
            body: JSON.stringify({ result: 'error', error: 'Rate limit exceeded' })
        };
    }

    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ result: 'error', error: 'Method Not Allowed' })
        };
    }

    // Optional shared-secret guard (set CONTACT_SECRET env var to enable)
    const secret = process.env.CONTACT_SECRET;
    if (secret) {
        // Token authentication (Bearer token) – optional
        const tokenEnv = process.env.CONTACT_TOKEN;
        if (tokenEnv) {
            const authHeader = event.headers['authorization'] || '';
            const tokenProvided = authHeader.replace(/^Bearer\s+/i, '').trim();
            if (tokenProvided !== tokenEnv) {
                return {
                    statusCode: 401,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ result: 'error', error: 'Invalid token' })
                };
            }
        }
        // Existing secret guard (if configured)
        const incoming = event.headers['x-contact-secret'] || '';
        if (secret && incoming !== secret) {
            return {
                statusCode: 401,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ result: 'error', error: 'Unauthorized' })
            };
        }
    }

    // Parse body
    let body;
    try {
        body = JSON.parse(event.body || '{}');
    } catch {
        return {
            statusCode: 400,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ result: 'error', error: 'Invalid JSON body' })
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
        contactNo: sanitise(body.contactNo),
        message: sanitise(body.message),
        department: sanitise(body.department) || 'General Inquiry',
        source_ip: event.headers['x-forwarded-for'] || 'unknown'
    };

    // ── GitHub API config ──────────────────────────────────────────────────────
    const token = process.env.GITHUB_TOKEN;
    const owner = process.env.GITHUB_REPO_OWNER;
    const repo  = process.env.GITHUB_REPO_NAME;
    const branch = process.env.GITHUB_BRANCH || 'main';

    if (!token || !owner || !repo) {
        console.error('Missing required environment variables: GITHUB_TOKEN, GITHUB_REPO_OWNER, GITHUB_REPO_NAME');
        return {
            statusCode: 500,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ result: 'error', error: 'Server configuration error' })
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
            // 404 is fine (file doesn't exist yet); anything else is a problem
            const errText = await getResponse.text();
            throw new Error(`GitHub GET failed (${getResponse.status}): ${errText}`);
        }

        // 2. Append the new submission
        currentSubmissions.push(submission);

        // 3. Encode updated content and commit back
        const updatedContent = Buffer.from(
            JSON.stringify(currentSubmissions, null, 2)
        ).toString('base64');

        const commitPayload = {
            message: `chore: add contact submission from ${submission.name} [${submission.id}]`,
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
            const errText = await putResponse.text();
            throw new Error(`GitHub PUT failed (${putResponse.status}): ${errText}`);
        }

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                result: 'success',
                id: submission.id,
                message: 'Submission saved successfully'
            })
        };

    } catch (err) {
        console.error('saveContact error:', err);
        return {
            statusCode: 500,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ result: 'error', error: 'Failed to save submission. Please try again.' })
        };
    }
};
