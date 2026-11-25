/* RAAD PROPERTY ACQUISITION NO 65 PTY LTD - site scripts (no tracking, no storage) */
(function () {
  'use strict';

  /*
   * Contact channels. Both are empty because the company's email and phone
   * are not yet confirmed, so the form is shown as "not yet connected".
   * Once confirmed, set CONTACT_EMAIL (opens a prefilled email) or
   * CONTACT_WHATSAPP (digits only, international format, opens WhatsApp).
   */
  var CONTACT_EMAIL = '';
  var CONTACT_WHATSAPP = '';

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Current year in footer */
  var yearEl = document.getElementById('year');
  if (yearEl) { yearEl.textContent = String(new Date().getFullYear()); }

  /* Mobile menu */
  var toggle = document.getElementById('menu-toggle');
  var menu = document.getElementById('mobile-menu');

  function setMenu(open) {
    if (!toggle || !menu) { return; }
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    menu.classList.toggle('hidden', !open);
    toggle.querySelector('.icon-open').classList.toggle('hidden', open);
    toggle.querySelector('.icon-close').classList.toggle('hidden', !open);
    toggle.querySelector('.sr-only').textContent = open ? 'Close main menu' : 'Open main menu';
  }

  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      setMenu(toggle.getAttribute('aria-expanded') !== 'true');
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        setMenu(false);
        toggle.focus();
      }
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth >= 768) { setMenu(false); }
    });
  }

  /* Smooth scroll for in-page links, moving focus to the target */
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      var id = link.getAttribute('href').slice(1);
      if (!id) { return; }
      var target = document.getElementById(id);
      if (!target) { return; }
      e.preventDefault();
      setMenu(false);
      target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
      if (!target.hasAttribute('tabindex')) { target.setAttribute('tabindex', '-1'); }
      target.focus({ preventScroll: true });
      if (history.replaceState) { history.replaceState(null, '', '#' + id); }
    });
  });

  /* Modals (Privacy Policy, Terms of Service) */
  var lastTrigger = null;

  function openModal(id) {
    var dlg = document.getElementById(id);
    if (!dlg) { return; }
    lastTrigger = document.activeElement;
    if (typeof dlg.showModal === 'function') {
      dlg.showModal();
    } else {
      dlg.setAttribute('open', '');
    }
    document.body.classList.add('modal-open');
    var closeBtn = dlg.querySelector('[data-close-modal]');
    if (closeBtn) { closeBtn.focus(); }
  }

  function closeModal(dlg) {
    if (!dlg) { return; }
    if (typeof dlg.close === 'function') {
      dlg.close();
    } else {
      dlg.removeAttribute('open');
      afterClose();
    }
  }

  function afterClose() {
    document.body.classList.remove('modal-open');
    if (lastTrigger && typeof lastTrigger.focus === 'function') { lastTrigger.focus(); }
  }

  document.querySelectorAll('[data-open-modal]').forEach(function (btn) {
    btn.addEventListener('click', function () { openModal(btn.getAttribute('data-open-modal')); });
  });

  document.querySelectorAll('dialog.modal').forEach(function (dlg) {
    dlg.addEventListener('close', afterClose);
    dlg.querySelectorAll('[data-close-modal]').forEach(function (btn) {
      btn.addEventListener('click', function () { closeModal(dlg); });
    });
    /* Click on the backdrop closes the dialog */
    dlg.addEventListener('click', function (e) {
      if (e.target === dlg) { closeModal(dlg); }
    });
    /* Esc fallback for browsers without native dialog support */
    dlg.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && typeof dlg.showModal !== 'function') { closeModal(dlg); }
    });
  });

  /* Enquiry form: client-side validation only */
  var form = document.getElementById('contact-form');
  if (!form) { return; }
  var statusEl = document.getElementById('form-status');
  var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  if (CONTACT_EMAIL || CONTACT_WHATSAPP) {
    var noticeTitle = document.getElementById('form-notice-title');
    var noticeText = document.getElementById('form-notice-text');
    if (noticeTitle) { noticeTitle.textContent = 'How this form works'; }
    if (noticeText) {
      noticeText.textContent = CONTACT_EMAIL
        ? 'Submitting opens your own email app with your message ready to send. Nothing is stored on this website.'
        : 'Submitting opens WhatsApp with your message ready to send. Nothing is stored on this website.';
    }
  }

  var fields = [
    { el: form.elements.namedItem('name'), check: function (v) { return v ? '' : 'Please enter your name.'; } },
    { el: form.elements.namedItem('email'), check: function (v) {
      if (!v) { return 'Please enter your email address.'; }
      return emailPattern.test(v) ? '' : 'Please enter a valid email address, like name@domain.com.au.';
    } },
    { el: form.elements.namedItem('topic'), check: function (v) { return v ? '' : 'Please choose an enquiry type.'; } },
    { el: form.elements.namedItem('message'), check: function (v) {
      if (!v) { return 'Please enter a message.'; }
      return v.length >= 10 ? '' : 'Please add a little more detail (at least 10 characters).';
    } }
  ];

  function showError(field, msg) {
    var err = document.getElementById(field.el.id + '-error');
    if (msg) {
      field.el.setAttribute('aria-invalid', 'true');
      if (err) { err.textContent = msg; err.hidden = false; }
    } else {
      field.el.removeAttribute('aria-invalid');
      if (err) { err.textContent = ''; err.hidden = true; }
    }
  }

  function validateField(field) {
    var msg = field.check(field.el.value.trim());
    showError(field, msg);
    return !msg;
  }

  fields.forEach(function (field) {
    field.el.addEventListener('blur', function () {
      if (field.el.value.trim() || field.el.hasAttribute('aria-invalid')) { validateField(field); }
    });
    field.el.addEventListener('input', function () {
      if (field.el.hasAttribute('aria-invalid')) { validateField(field); }
    });
  });

  function setStatus(kind, text) {
    statusEl.className = 'form-status is-' + kind;
    statusEl.textContent = text;
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var firstInvalid = null;
    fields.forEach(function (field) {
      if (!validateField(field) && !firstInvalid) { firstInvalid = field.el; }
    });

    if (firstInvalid) {
      setStatus('error', 'Please correct the highlighted fields.');
      firstInvalid.focus();
      return;
    }

    var name = form.elements.namedItem('name').value.trim();
    var email = form.elements.namedItem('email').value.trim();
    var org = form.elements.namedItem('organisation').value.trim();
    var topic = form.elements.namedItem('topic').value;
    var message = form.elements.namedItem('message').value.trim();
    var body = 'Name: ' + name + '\nEmail: ' + email + (org ? '\nOrganisation: ' + org : '') +
      '\nEnquiry type: ' + topic + '\n\n' + message;

    if (CONTACT_EMAIL) {
      window.location.href = 'mailto:' + CONTACT_EMAIL +
        '?subject=' + encodeURIComponent('Website enquiry: ' + topic) +
        '&body=' + encodeURIComponent(body);
      setStatus('ok', 'Your email app has opened with your message. Press send to reach us.');
      return;
    }

    if (CONTACT_WHATSAPP) {
      window.open('https://wa.me/' + CONTACT_WHATSAPP + '?text=' + encodeURIComponent(body), '_blank', 'noopener');
      setStatus('ok', 'WhatsApp has opened with your message. Press send in WhatsApp to reach us.');
      return;
    }

    setStatus('info', 'Your enquiry has not been sent. This form is not yet connected, so nothing you entered has been sent or stored. Please use the contact details on this page once they are confirmed.');
  });
})();
