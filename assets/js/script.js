/* BAMBLUE Landing Page — vanilla JS */
(function () {
  'use strict';

  // 1. Ano dinâmico no footer
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // 2. Sticky CTA, aparece depois de sair da hero
  var stickyCta = document.getElementById('stickyCta');
  var hero = document.getElementById('hero');
  if (stickyCta && hero) {
    var heroObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          stickyCta.classList.remove('is-visible');
          stickyCta.setAttribute('aria-hidden', 'true');
        } else {
          stickyCta.classList.add('is-visible');
          stickyCta.setAttribute('aria-hidden', 'false');
        }
      });
    }, { threshold: 0.1 });
    heroObserver.observe(hero);
  }

  // 3. FAQ accordion — só um aberto de cada vez
  var items = document.querySelectorAll('.accordion__item');
  items.forEach(function (item) {
    item.addEventListener('toggle', function () {
      if (item.open) {
        items.forEach(function (other) {
          if (other !== item) other.open = false;
        });
      }
    });
  });

  // 4. Smooth scroll com offset para o header
  var headerH = 72;
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      var hash = link.getAttribute('href');
      if (hash.length <= 1) return;
      var target = document.querySelector(hash);
      if (!target) return;
      e.preventDefault();
      var y = target.getBoundingClientRect().top + window.scrollY - headerH;
      window.scrollTo({ top: y, behavior: 'smooth' });
    });
  });

  // 5. Form — validação e submissão
  var form = document.getElementById('leadForm');
  if (!form) return;

  var errorBox = document.getElementById('formError');
  var submitBtn = form.querySelector('button[type="submit"]');

  function showError(msg) {
    if (!errorBox) return;
    errorBox.hidden = false;
    errorBox.textContent = msg;
  }
  function clearError() {
    if (!errorBox) return;
    errorBox.hidden = true;
    errorBox.textContent = '';
  }
  function validEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }
  function validPhone(v) { return /^\+?[\d\s()-]{9,}$/.test(v); }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    clearError();

    var data = {};
    var fd = new FormData(form);
    fd.forEach(function (v, k) { data[k] = v; });

    if (!data.nome || !data.empresa || !data.cargo || !data.email || !data.telefone || !data.setor) {
      showError('Por favor preencha todos os campos obrigatórios.');
      return;
    }
    if (!validEmail(data.email)) {
      showError('Email inválido. Por favor verifique.');
      form.email.focus();
      return;
    }
    if (!validPhone(data.telefone)) {
      showError('Telefone inválido. Por favor verifique.');
      form.telefone.focus();
      return;
    }
    if (!form.rgpd.checked) {
      showError('Para submeter, é necessário aceitar a política de privacidade.');
      return;
    }

    // UTM e tracking context
    data.url = window.location.href;
    data.referrer = document.referrer;
    data.timestamp = new Date().toISOString();
    var params = new URLSearchParams(window.location.search);
    ['utm_source','utm_medium','utm_campaign','utm_content','utm_term','fbclid','gclid'].forEach(function (k) {
      if (params.get(k)) data[k] = params.get(k);
    });

    submitBtn.disabled = true;
    submitBtn.classList.add('is-loading');

    var action = form.getAttribute('action');
    if (!action || action.indexOf('REPLACE_WITH_WEBHOOK_URL') !== -1) {
      console.warn('[BAMBLUE LP] form action não configurado, dados:', data);
      window.setTimeout(function () { window.location.href = '/thank-you.html'; }, 800);
      return;
    }

    fetch(action, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(data)
    })
      .then(function (res) {
        if (!res.ok) throw new Error('Erro ' + res.status);

        // As conversões (Meta Lead + GA4 generate_lead) são disparadas pelo GTM
        // através do dataLayer.push abaixo. NÃO disparar fbq/gtag aqui — duplica o evento.

        // Evento personalizado GTM
        var redirected = false;
        function goThankYou() {
          if (redirected) return;
          redirected = true;
          window.location.href = '/thank-you.html';
        }
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
          event: 'lead_lp_bamblue',
          form_id: 'leadForm',
          setor: data.setor,
          cargo: data.cargo,
          n_trabalhadores: data.n_trabalhadores || '',
          eventCallback: goThankYou,
          eventTimeout: 1500
        });
        // Fallback caso o GTM não responda (ex.: bloqueador de anúncios)
        window.setTimeout(goThankYou, 1600);
      })
      .catch(function (err) {
        console.error('[BAMBLUE LP] erro ao submeter:', err);
        showError('Ocorreu um erro ao submeter. Por favor tente novamente ou contacte info@bamblue.pt.');
        submitBtn.disabled = false;
        submitBtn.classList.remove('is-loading');
      });
  });

  // 6. CTA click tracking
  document.querySelectorAll('[data-cta]').forEach(function (el) {
    el.addEventListener('click', function () {
      var cta = el.getAttribute('data-cta');
      if (window.fbq) window.fbq('trackCustom', 'CTAClick', { cta_location: cta });
      if (window.gtag) window.gtag('event', 'cta_click', { cta_location: cta });
    });
  });

  // 7. Scroll reveal
  if (!('IntersectionObserver' in window)) {
    document.querySelectorAll('.servico-card,.porque-card,.case-card,.quote,.stat-item,.problem__item').forEach(function (el) {
      el.classList.add('is-visible');
    });
    return;
  }
  var revealEls = document.querySelectorAll('.servico-card,.porque-card,.case-card,.quote,.stat-item,.problem__item');
  var revealObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  revealEls.forEach(function (el) { revealObserver.observe(el); });

  // Stagger dentro dos grupos
  document.querySelectorAll('.servicos__grid,.porque__grid,.cases__grid,.testimonios__grid,.stats__list').forEach(function (group) {
    var children = group.children;
    var delay = 0;
    Array.prototype.forEach.call(children, function (child) {
      child.style.transitionDelay = delay + 'ms';
      delay += 90;
    });
  });

  // 8. Contador animado nas stats
  var statsNums = document.querySelectorAll('.stat-item__num');
  if (statsNums.length) {
    var statsObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        statsObserver.unobserve(entry.target);
        var el = entry.target;
        var raw = el.textContent.trim();
        var prefix = raw.match(/^[^0-9]*/)[0];
        var suffix = raw.match(/[^0-9]*$/)[0];
        var num = parseInt(raw.replace(/\D/g, ''), 10);
        if (!num) return;
        var duration = 900;
        var start = performance.now();
        function tick(now) {
          var elapsed = Math.min(now - start, duration);
          var ease = 1 - Math.pow(1 - elapsed / duration, 3);
          el.textContent = prefix + Math.round(ease * num) + suffix;
          if (elapsed < duration) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
      });
    }, { threshold: 0.5 });
    statsNums.forEach(function (el) { statsObserver.observe(el); });
  }
})();
