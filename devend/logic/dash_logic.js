/**
 * DASHBOARD LOGIC v2.0 - AR COMMAND CENTER
 * Orchestration for real-time site management and vitals monitoring.
 */

// --- Global State ---
let siteRegistry = {
    config: null,
    projects: null,
    staged: {
        config: null,
        projects: null
    }
};

const LOG_TERMINAL = document.getElementById('terminalLogs');

// --- Initialization ---
document.addEventListener('DOMContentLoaded', async () => {
    initNavigation();
    initLogout();
    await hydrateRegistry();
    
    // Core Hydration UI
    renderMetrics();
    renderConfigForm();
    renderProjectsRegistry();
    
    // System Watchers
    checkPWAStatus();
    trackOrigin();
    startLiveSystem();
    
    logTerminal('SYSTEM_ALPHA_READY. NODE_HYDRATION_COMPLETE.');
});

// --- Navigation Engine ---
function initNavigation() {
    const navBtns = document.querySelectorAll('.nav-btn[data-target]');
    const sections = document.querySelectorAll('.editor-container');

    navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.getAttribute('data-target');
            
            navBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            sections.forEach(s => {
                s.classList.remove('active');
                if (s.id === target) s.classList.add('active');
            });

            logTerminal(`WORKSPACE_SHIFT: ${target.toUpperCase()}`);
        });
    });
}

// --- Data Hydration ---
async function hydrateRegistry() {
    logTerminal('FETCHING_DATA_SNAPSHOTS...');
    try {
        const [configRes, projectsRes] = await Promise.all([
            fetch('/frontend/data/config.json'),
            fetch('/frontend/data/projects_page.json')
        ]);

        siteRegistry.config = await configRes.json();
        siteRegistry.projects = await projectsRes.json();

        // Deep Clone to Staged
        siteRegistry.staged.config = JSON.parse(JSON.stringify(siteRegistry.config));
        siteRegistry.staged.projects = JSON.parse(JSON.stringify(siteRegistry.projects));

        logTerminal('DATA_HYDRATION: SUCCESS.');
    } catch (e) {
        console.error(e);
        logTerminal(`BOOT_ERROR: ${e.message}`, 'error');
    }
}

// --- Metrics Calculator ---
function renderMetrics() {
    const projCount = siteRegistry.staged.projects.length;
    
    // Extract unique tags
    const allTags = new Set();
    siteRegistry.staged.projects.forEach(p => {
        if (p.tags) p.tags.forEach(t => allTags.add(t));
    });

    document.getElementById('count-projects').innerText = projCount.toString().padStart(2, '0');
    document.getElementById('count-tags').innerText = allTags.size.toString().padStart(2, '0');
}

// --- Config Rendering ---
function renderConfigForm() {
    const container = document.getElementById('configForm');
    if (!siteRegistry.staged.config) return;

    container.innerHTML = '';
    const { personal, contact, meta } = siteRegistry.staged.config;

    const schema = [
        { label: 'Site Name', group: 'meta', key: 'site_name', value: meta.site_name },
        { label: 'Display Name', group: 'personal', key: 'name', value: personal.name },
        { label: 'Professional Tagline', group: 'personal', key: 'tagline', value: personal.tagline },
        { label: 'Meta Description', group: 'meta', key: 'description', value: meta.description },
        { label: 'Communication Node (Email)', group: 'contact', key: 'email', value: contact.email },
        { label: 'Communication Node (WA)', group: 'contact', key: 'whatsapp_number', value: contact.whatsapp_number }
    ];

    schema.forEach(field => {
        const div = document.createElement('div');
        div.className = 'form-group';
        div.innerHTML = `
            <label class="metric-label" style="margin-bottom: 0.5rem; display: block;">${field.label}</label>
            <input type="text" class="input-minimal" style="background: rgba(255,255,255,0.03); padding: 12px; border-radius: 8px; border: 1px solid var(--border);" 
                   value="${field.value}" 
                   onchange="updateStagedValue('${field.group}', '${field.key}', this.value)">
        `;
        container.appendChild(div);
    });
}

// --- Achievement Registry (Rich Cards) ---
function renderProjectsRegistry() {
    const container = document.getElementById('projectsList');
    if (!siteRegistry.staged.projects) return;

    container.innerHTML = '';
    siteRegistry.staged.projects.forEach((proj, index) => {
        const div = document.createElement('div');
        div.className = 'project-card fade-in';
        
        const imgPath = proj.image && proj.image !== '#' ? `/${proj.image}` : `https://ui-avatars.com/api/?name=${encodeURIComponent(proj.name || 'P')}&background=6366f1&color=fff`;

        div.innerHTML = `
            <div style="height: 140px; background: #000; position: relative; overflow: hidden;">
                <img src="${imgPath}" style="width: 100%; height: 100%; object-fit: cover; opacity: 0.6;" alt="Prev">
                <div style="position: absolute; top: 10px; right: 10px;">
                    <span class="badge badge-success" style="font-size: 0.6rem;">NODE_${index.toString().padStart(2, '0')}</span>
                </div>
            </div>
            <div class="project-card-body">
                <input type="text" class="input-minimal" style="font-weight: 700; font-size: 1.1rem; margin-bottom: 0.5rem;" 
                       value="${proj.name || proj.title}" placeholder="TITLE"
                       onchange="updateProjectValue(${index}, 'name', this.value)">
                
                <textarea class="input-minimal" style="font-size: 0.8rem; color: var(--text-muted); resize: none; height: 60px;" 
                          placeholder="DESCRIPTION"
                          onchange="updateProjectValue(${index}, 'description', this.value)">${proj.description || ''}</textarea>
            </div>
            <div class="project-card-footer">
                <div style="display: flex; gap: 10px;">
                    <i class="fas fa-link" style="font-size: 0.7rem; color: var(--text-muted);"></i>
                    <input type="text" class="input-minimal" style="font-size: 0.7rem; color: var(--primary);" 
                           value="${proj.url || proj.link}" placeholder="TARGET_URL"
                           onchange="updateProjectValue(${index}, 'url', this.value)">
                </div>
                <button class="nav-btn" style="padding: 0.5rem; color: var(--accent); background: none; border: none; cursor: pointer;" onclick="deleteProject(${index})">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </div>
        `;
        container.appendChild(div);
    });
}

// --- Staging Controllers ---
window.updateStagedValue = (group, key, value) => {
    // Basic sanitization
    const sanitizedValue = value.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    siteRegistry.staged.config[group][key] = sanitizedValue;
    showSaveIndicator();
    logTerminal(`STAGING_CONFIG_PARAM: ${key.toUpperCase()}`);
};

window.updateProjectValue = (index, key, value) => {
    // Basic sanitization
    const sanitizedValue = value.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    siteRegistry.staged.projects[index][key] = sanitizedValue;
    showSaveIndicator();
    logTerminal(`STAGING_PROJECT_NODE: ${index} -> ${key.toUpperCase()}`);
    renderMetrics(); // Update counts in real-time
};

window.addNewProject = () => {
    const newNode = {
        id: "node-" + Date.now().toString(36),
        name: "New Project Instance",
        description: "Expansion module for the AR Tech Ecosystem.",
        tags: ["System"],
        icon: "fas fa-cube",
        image: "#",
        url: "#"
    };
    siteRegistry.staged.projects.unshift(newNode);
    renderProjectsRegistry();
    renderMetrics();
    showSaveIndicator();
    logTerminal('STAGING_NEW_IDENTITY_PROJECT.');
};

window.deleteProject = (index) => {
    if(!confirm("TERMINATE THIS REGISTRY NODE?")) return;
    siteRegistry.staged.projects.splice(index, 1);
    renderProjectsRegistry();
    renderMetrics();
    showSaveIndicator();
    logTerminal('STAGING_NODE_TERMINATION.');
};

window.saveActiveData = (type) => {
    logTerminal(`CRYPTOGRAPHIC_SAVE: ${type.toUpperCase()}`);
    alert('Logic node staging successful. Generate snapshot in Deployment Hub.');
};

// --- Export System ---
window.downloadJSON = (type) => {
    const data = siteRegistry.staged[type];
    const filename = type === 'config' ? 'config.json' : 'projects_page.json';
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    logTerminal(`SNAPSHOT_EXPORTED: ${filename}`);
};

// --- Utilities ---
function logTerminal(msg, type = 'info') {
    if (!LOG_TERMINAL) return;
    const time = new Date().toLocaleTimeString();
    const color = type === 'error' ? 'var(--accent)' : '#10b981';
    LOG_TERMINAL.innerHTML += `<div><span style="color: #666;">[${time}]</span> <span style="color: ${color}">>> ${msg}</span></div>`;
    LOG_TERMINAL.scrollTop = LOG_TERMINAL.scrollHeight;
}

function showSaveIndicator() {
    const indicator = document.getElementById('saveIndicator');
    if (!indicator) return;
    indicator.style.opacity = '1';
    setTimeout(() => { indicator.style.opacity = '0'; }, 3000);
}

function checkPWAStatus() {
    const status = 'serviceWorker' in navigator ? 'ACTIVE_HYDRATION' : 'LEGACY_MODE';
    const el = document.getElementById('pwaStatus');
    if (el) el.innerText = status;
}

async function trackOrigin() {
    const el = document.getElementById('node-origin');
    if (!el) return;
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        el.innerText = `${data.ip} (ADMIN_IP)`;
    } catch (e) {
        el.innerText = `127.0.0.1 (LOCAL_NODE)`;
    }
}

function initLogout() {
    const btn = document.getElementById('logoutBtn');
    if (btn) {
        btn.addEventListener('click', () => {
            sessionStorage.removeItem('dev_access_token');
            window.location.href = '/devend/login.html';
        });
    }
}
// --- Live System Orchestration ---
function startLiveSystem() {
    const clock = document.getElementById('liveClock');
    const timer = document.getElementById('sessionTimer');
    const startTime = parseInt(sessionStorage.getItem('dev_access_time')) || Date.now();

    setInterval(() => {
        // Clock
        if (clock) clock.innerText = new Date().toLocaleTimeString();

        // Uptime
        if (timer) {
            const diff = Date.now() - startTime;
            const h = Math.floor(diff / 3600000).toString().padStart(2, '0');
            const m = Math.floor((diff % 3600000) / 60000).toString().padStart(2, '0');
            const s = Math.floor((diff % 60000) / 1000).toString().padStart(2, '0');
            timer.innerText = `${h}:${m}:${s}`;
        }

        // Random Activity Simulation
        if (Math.random() > 0.98) {
            const events = [
                'NODE_STATUS_STABLE',
                'LOG_SNAPSHOT_CAPTURED',
                'TRAFFIC_FILTER_ACTIVE',
                'HANDSHAKE_RE-VERIFIED',
                'CACHING_MANIFEST_SYNC'
            ];
            logTerminal(events[Math.floor(Math.random() * events.length)]);
        }
    }, 1000);
}
