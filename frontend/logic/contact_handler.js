/**
 * contact_handler.js — Enhanced with CSRF token and improved validation
 * Extracted logic for handling Contact Form interactions across the portfolio.
 * Dynamically resolves target variables based on standard data architectures.
 */

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('contactForm');

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
        email: 'abhinavranjanofficial@gmail.com',
        telegram_username: 'ar_abhinavranjan',
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

    /* ==========================================================
       APPOINTMENT BOOKING HANDLERS
       ========================================================== */
    const initAppointmentHandlers = () => {
        const apptForm = document.getElementById('appointmentForm');
        if (!apptForm) return;

        const getApptData = () => ({
            name: (document.getElementById('apptName') || {}).value || '',
            email: (document.getElementById('apptEmail') || {}).value || '',
            phone: (document.getElementById('apptPhone') || {}).value || '',
            date: (document.getElementById('apptDate') || {}).value || '',
            reason: (document.getElementById('apptReason') || {}).value || 'General Consultation',
            notes: (document.getElementById('apptNotes') || {}).value || ''
        });

        const validateAppt = (d) => {
            const errs = [];
            if (!d.name.trim()) errs.push('apptName');
            if (!d.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email)) errs.push('apptEmail');
            if (!d.phone.trim()) errs.push('apptPhone');
            if (!d.date) errs.push('apptDate');
            return errs;
        };

        const highlightField = (id) => {
            const el = document.getElementById(id);
            if (el) {
                el.style.borderColor = '#ef4444';
                el.focus();
                setTimeout(() => { el.style.borderColor = ''; }, 3000);
            }
        };

        // Compact format for Telegram & WhatsApp
        const buildCompactApptText = (d) => {
            return `Appointment Request; Name: ${d.name}; Phone: ${d.phone}; Email: ${d.email}; Date: ${d.date}; Reason: ${d.reason}; Notes: ${d.notes || 'N/A'}`;
        };

        // Detailed full format for Email & Web API
        const buildFullApptText = (d) => {
            return `APPOINTMENT REQUEST DETAILS\n------------------------------------\nFull Name: ${d.name}\nPhone Number: ${d.phone}\nEmail Address: ${d.email}\nPreferred Date & Time: ${d.date}\nReason for Appointment: ${d.reason}\nAdditional Notes / Context:\n${d.notes || 'None provided.'}\n------------------------------------\nSubmitted via AR. Abhinav Ranjan Portfolio`;
        };

        /* 1. Request via WhatsApp */
        document.getElementById('apptWhatsapp')?.addEventListener('click', e => {
            e.preventDefault();
            const d = getApptData();
            const errs = validateAppt(d);
            if (errs.length) {
                errs.forEach(highlightField);
                showToast('Please fill all required appointment fields (Name, Email, Phone, Date)');
                return;
            }
            window.open(`https://wa.me/${contactConfig.whatsapp_number}?text=${encodeURIComponent(buildCompactApptText(d))}`, '_blank');
        });

        /* 2. Request via Telegram */
        document.getElementById('apptTelegram')?.addEventListener('click', e => {
            e.preventDefault();
            const d = getApptData();
            const errs = validateAppt(d);
            if (errs.length) {
                errs.forEach(highlightField);
                showToast('Please fill all required appointment fields (Name, Email, Phone, Date)');
                return;
            }
            window.open(`https://t.me/${contactConfig.telegram_username}?text=${encodeURIComponent(buildCompactApptText(d))}`, '_blank');
        });

        /* 3. Request via Email */
        document.getElementById('apptEmailBtn')?.addEventListener('click', e => {
            e.preventDefault();
            const d = getApptData();
            const errs = validateAppt(d);
            if (errs.length) {
                errs.forEach(highlightField);
                showToast('Please fill all required appointment fields (Name, Email, Phone, Date)');
                return;
            }
            const subj = encodeURIComponent(`Appointment Request: ${d.reason} - ${d.name}`);
            window.location.href = `mailto:${contactConfig.email}?subject=${subj}&body=${encodeURIComponent(buildFullApptText(d))}`;
        });

        /* 4. Request via Website API */
        const apptWebBtn = document.getElementById('apptWebBtn');
        apptWebBtn?.addEventListener('click', async e => {
            e.preventDefault();
            const d = getApptData();
            const errs = validateAppt(d);
            if (errs.length) {
                errs.forEach(highlightField);
                showToast('Please fill all required appointment fields (Name, Email, Phone, Date)');
                return;
            }

            const orig = apptWebBtn.innerHTML;
            apptWebBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Booking...';
            apptWebBtn.disabled = true;

            try {
                const resp = await fetch('/api/saveContact', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...d, message: buildFullApptText(d), subject: 'Appointment Request' })
                });
                if (resp.ok) {
                    showToast('Appointment request submitted successfully!');
                    apptForm.reset();
                } else {
                    throw new Error('Server error');
                }
            } catch (err) {
                showToast('Submitted appointment via WhatsApp fallback!');
                window.open(`https://wa.me/${contactConfig.whatsapp_number}?text=${encodeURIComponent(buildCompactApptText(d))}`, '_blank');
            } finally {
                apptWebBtn.innerHTML = orig;
                apptWebBtn.disabled = false;
            }
        });
    };

    initAppointmentHandlers();
});
