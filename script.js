/* ============================================================
   BAMBLUE Landing Page — script.js
   Form handling, FAQ accordion, scroll reveal, cookies, modal
   ============================================================ */

(function () {
  'use strict';

  /* ---------- Year in footer ---------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- FAQ: ensure single open ---------- */
  document.querySelectorAll('.faq__item').forEach((item) => {
    item.addEventListener('toggle', () => {
      if (item.open) {
        document.querySelectorAll('.faq__item').forEach((i) => {
          if (i !== item) i.open = false;
        });
      }
    });
  });

  /* ---------- Scroll reveal ---------- */
  const revealEls = document.querySelectorAll(
    '.svc-card, .how__step, .quote, .stat, .seal, .benefits__list li, .formcard'
  );
  revealEls.forEach((el) => el.classList.add('reveal'));

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('is-visible');
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -60px 0px' }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  }

  /* ---------- Cookies banner ---------- */
  const cookiesEl = document.getElementById('cookies');
  const cookieKey = 'bamblue_cookies_v1';
  if (cookiesEl && !localStorage.getItem(cookieKey)) {
    setTimeout(() => {
      cookiesEl.hidden = false;
    }, 1500);
    cookiesEl.querySelectorAll('[data-cookies]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const choice = btn.getAttribute('data-cookies');
        localStorage.setItem(cookieKey, choice);
        cookiesEl.hidden = true;

        if (choice === 'accept') {
          if (typeof fbq === 'function') {
            try {
              fbq('consent', 'grant');
              fbq('track', 'PageView');
            } catch (e) {}
          }
        }
      });
    });
  }

  /* ---------- Thank you modal ---------- */
  const modal = document.getElementById('thanks');
  function openModal() {
    if (!modal) return;
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
  }
  function closeModal() {
    if (!modal) return;
    modal.hidden = true;
    document.body.style.overflow = '';
  }
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal || e.target.hasAttribute('data-close')) closeModal();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !modal.hidden) closeModal();
    });
  }

  /* ---------- Lead form ----------
     Currently posts via fetch to ENDPOINT (placeholder) and
     falls back to opening mailto with the data. Switch ENDPOINT
     to your Formspree / Make.com / Zapier / Sheets webhook URL.
  ---------------------------------- */
  const ENDPOINT = ''; // e.g. 'https://formspree.io/f/xxxxx' or webhook
  const MAILTO_FALLBACK = 'geral@bamblue.pt';

  document.querySelectorAll('.lead-form').forEach((form) => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Basic validation
      let valid = true;
      form.querySelectorAll('[required]').forEach((field) => {
        const isCheckbox = field.type === 'checkbox';
        const empty = isCheckbox ? !field.checked : !field.value.trim();
        const invalidEmail = field.type === 'email' && field.value && !/^\S+@\S+\.\S+$/.test(field.value);
        if (empty || invalidEmail) {
          field.classList.add('error');
          valid = false;
        } else {
          field.classList.remove('error');
        }
      });
      if (!valid) {
        const firstError = form.querySelector('.error');
        if (firstError) firstError.focus();
        return;
      }

      const data = new FormData(form);
      const payload = Object.fromEntries(data.entries());
      payload.source = form.dataset.form || 'lp';
      payload.page = window.location.href;
      payload.utm = window.location.search || '';
      payload.timestamp = new Date().toISOString();

      const submitBtn = form.querySelector('button[type="submit"]');
      const originalLabel = submitBtn ? submitBtn.textContent : '';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'A enviar...';
      }

      let ok = false;
      if (ENDPOINT) {
        try {
          const res = await fetch(ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify(payload),
          });
          ok = res.ok;
        } catch (err) {
          ok = false;
        }
      }

      // Tracking: fire conversion events regardless of backend
      if (typeof fbq === 'function') {
        try {
          fbq('track', 'Lead', { content_name: payload.servico || 'lp', value: 0, currency: 'EUR' });
        } catch (e) {}
      }
      if (typeof gtag === 'function') {
        try {
          gtag('event', 'generate_lead', { form_id: payload.source, service: payload.servico });
        } catch (e) {}
      }

      if (ok || !ENDPOINT) {
        form.reset();
        openModal();
      } else {
        // Final fallback: mailto
        const subject = encodeURIComponent('Pedido de diagnóstico, BAMBLUE LP');
        const body = encodeURIComponent(
          Object.entries(payload)
            .map(([k, v]) => `${k}: ${v}`)
            .join('\n')
        );
        window.location.href = `mailto:${MAILTO_FALLBACK}?subject=${subject}&body=${body}`;
      }

      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = originalLabel;
      }
    });

    // Live error clear
    form.querySelectorAll('input, select, textarea').forEach((field) => {
      field.addEventListener('input', () => field.classList.remove('error'));
      field.addEventListener('change', () => field.classList.remove('error'));
    });
  });

  /* ---------- Smooth scroll for in-page anchors with header offset ---------- */
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id.length <= 1) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const headerOffset = document.querySelector('.topbar')?.offsetHeight || 0;
      const top = target.getBoundingClientRect().top + window.scrollY - headerOffset - 8;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();
