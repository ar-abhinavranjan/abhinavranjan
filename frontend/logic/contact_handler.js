/**
 * contact_handler.js — Enhanced with CSRF token and improved validation
 * Extracted logic for handling Contact Form interactions across the portfolio.
 * Dynamically resolves target variables based on standard data architectures.
 */

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('contactForm');
    if (!form) return;

    // Form validation rules
    const validators = {
        name: (val) => val.trim().length >= 2 && val.trim().length <= 100,
        email: (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
        contactNo: (val) => !val || /^[+]?[0-9]{1,15}$/.test(val),
        message: (val) => val.trim().length >= 10 && val.trim().length <= 2000
    };

    // Generate CSRF token
    const getCsrfToken = () => {
        let token = sessionStorage.getItem('csrf-token');
        if (!token) {
            token = `csrf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            sessionStorage.setItem('csrf-token', token);
        }
        return token;
    };

    // Detect page context
    const path = window.location.pathname;
    const isFAQ = path.includes('asked-questions');
    const dataFile = isFAQ ? 'faq_contact.json' : 'contact_page.json';

    let contactConfig = {
        whatsapp_number: '918294721929',
        email: 'abhinavranjanmit@gmail.com',
        telegram_username: 'abhinav_ranjan',
        routing_department: 'General Inquiry',
        data_save_method: 'netlify_functions'
    };

    // Attempt to preload specific route config
    fetch(`/frontend/data/${dataFile}`)
        .then(r => {
            if (!r.ok) throw new Error(`HTTP error! status: ${r.status}`);
            return r.json();
        })
        .then(data => { contactConfig = { ...contactConfig, ...data }; })
        .catch(err => console.warn('Could not load specific contact config, using defaults.', err));

    const getFormData = () => ({
        name: (document.getElementById('name') || {}).value || '',
        email: (document.getElementById('email') || {}).value || '',
        contactNo: (document.getElementById('contactNo') || {}).value || '',
        message: (document.getElementById('message') || {}).value || '',
        department: contactConfig.routing_department,
        csrf_token: getCsrfToken()
    });

    const validateForm = (data) => {
        const errors = [];
        if (!validators.name(data.name)) errors.push('name');
        if (!validators.email(data.email)) errors.push('email');
        if (!validators.contactNo(data.contactNo)) errors.push('contactNo');
        if (!validators.message(data.message)) errors.push('message');
        return errors;
    };

    const showFieldError = (fieldId) => {
        const errorEl = document.getElementById(`${fieldId}Error`);
        if (errorEl) errorEl.classList.add('show');
    };

    const hideFieldError = (fieldId) => {
        const errorEl = document.getElementById(`${fieldId}Error`);
        if (errorEl) errorEl.classList.remove('show');
    };

    const showToast = (msg) => {
        let t = document.getElementById('toast');
        if (!t) {
            t = document.createElement('div');
            t.id = 'toast';
            t.className = 'toast';
            document.body.appendChild(t);
        }
        t.innerText = msg;
        t.className = 'toast show';
        setTimeout(() => { t.className = t.className.replace('show', ''); }, 3000);
    };

    const buildMessage = (data) => {
        let msg = contactConfig.message_format || "Name: {name}\nEmail: {email}\nPhone: {contactNo}\nMessage: {message}";
        return msg.replace('{name}', data.name).replace('{email}', data.email).replace('{contactNo}', data.contactNo).replace('{message}', data.message);
    };

    /* WhatsApp Target */
    document.getElementById('sendWhatsapp')?.addEventListener('click', e => {
        e.preventDefault();
        const data = getFormData();
        const errors = validateForm(data);
        if (errors.length) {
            errors.forEach(showFieldError);
            showToast('Please correct the errors in the form');
            return;
        }
        
        const payload = encodeURIComponent(buildMessage(data));
        window.open(`https://wa.me/${contactConfig.whatsapp_number}?text=${payload}`, '_blank');
    });

    /* Email Target */
    document.getElementById('sendEmail')?.addEventListener('click', e => {
        e.preventDefault();
        const data = getFormData();
        const errors = validateForm(data);
        if (errors.length) {
            errors.forEach(showFieldError);
            showToast('Please correct the errors in the form');
            return;
        }
        
        const payload = encodeURIComponent(buildMessage(data));
        const subject = encodeURIComponent(`${contactConfig.routing_department} from ${data.name}`);
        window.location.href = `mailto:${contactConfig.email}?subject=${subject}&body=${payload}`;
    });

    /* Telegram Target */
    document.getElementById('sendTelegram')?.addEventListener('click', e => {
        e.preventDefault();
        const data = getFormData();
        const errors = validateForm(data);
        if (errors.length) {
            errors.forEach(showFieldError);
            showToast('Please correct the errors in the form');
            return;
        }
        
        const payload = encodeURIComponent(buildMessage(data));
        window.open(`https://t.me/${contactConfig.telegram_username}?text=${payload}`, '_blank');
    });

    /* Direct Web Server Target (Netlify Function) */
    const webBtn = document.getElementById('sendWeb');
    webBtn?.addEventListener('click', async (e) => {
        e.preventDefault();
        const formData = getFormData();
        const errors = validateForm(formData);
        
        if (errors.length) {
            errors.forEach(showFieldError);
            showToast('Please correct the errors in the form');
            return;
        }

        errors.forEach(hideFieldError);
        const originalText = webBtn.innerHTML;
        webBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        webBtn.disabled = true;

        try {
            const response = await fetch('/api/saveContact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-Token': formData.csrf_token,
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: JSON.stringify(formData)
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            if (result.result === 'success') {
                showToast('Message sent successfully!');
                document.getElementById('contactForm')?.reset();
                sessionStorage.removeItem('csrf-token');
            } else {
                throw new Error(result.error || 'Server error');
            }
        } catch (error) {
            console.error('Transmission failed:', error);
            showToast('Network error while sending. Try WhatsApp.');
        } finally {
            webBtn.innerHTML = originalText;
            webBtn.disabled = false;
        }
    });
});
