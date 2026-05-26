/**
 * authLogin.js — Netlify Serverless Function
 * Validates user credentials against stored hashes and issues a short-lived auth cookie.
 */

const FILE_PATH = 'devend/private/keys/login.js';

// Pre‑computed SHA‑256 hashes (must match the ones in the repo)
const STORED_UID_HASH = 'f6f55fbfea49b72d56262b05aa27689c5171bf39d57c5b81e4a36d99c14390d2';
const STORED_PASS_HASH = 'dee8849bddd5459bd7cd217774340fd1a52141813a9a407bfdabd7f9c9cd9b5f';

/** Helper to compute SHA‑256 of a string */
async function sha256(message) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: false, error: 'Method Not Allowed' })
    };
  }

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: false, error: 'Invalid JSON' })
    };
  }

  const { uid, password } = body;
  if (!uid || !password) {
    return {
      statusCode: 422,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: false, error: 'Missing uid or password' })
    };
  }

  // Compute hashes
  const [uidHash, passHash] = await Promise.all([sha256(uid), sha256(password)]);

  if (uidHash === STORED_UID_HASH && passHash === STORED_PASS_HASH) {
    // Issue a simple base64 token (uid:timestamp) valid for 30 min
    const token = Buffer.from(`${uid}:${Date.now() + 30 * 60 * 1000}`).toString('base64');
    const cookie = `dev_access_token=${token}; HttpOnly; Path=/; Max-Age=1800; SameSite=Strict`; // 30 min
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': cookie,
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ success: true })
    };
  } else {
    return {
      statusCode: 401,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: false, error: 'Invalid credentials' })
    };
  }
};
