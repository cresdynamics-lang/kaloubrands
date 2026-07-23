(function () {
  'use strict';

  // Theme: light / dark with localStorage persistence
  var root = document.documentElement;
  var THEME_KEY = 'kalou-theme';

  function getPreferredTheme() {
    var saved = localStorage.getItem(THEME_KEY);
    if (saved === 'light' || saved === 'dark') return saved;
    return 'dark';
  }

  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);
    document.querySelectorAll('.theme-toggle').forEach(function (btn) {
      btn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
      btn.setAttribute('title', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
    });
  }

  applyTheme(getPreferredTheme());

  document.querySelectorAll('.theme-toggle').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      applyTheme(next);
    });
  });

  // Inject logo image on every page
  document.querySelectorAll('.js-logo').forEach(function (img) {
    img.src = 'images/logo.jpeg';
  });

  // Hide images that fail to load - replace service media with branded panel
  document.querySelectorAll('[data-hide-on-error]').forEach(function (img) {
    img.addEventListener('error', function () {
      var media = img.closest('.service-media');
      if (media) {
        var title = (media.closest('.service-card') || {}).querySelector
          ? (media.closest('.service-card').querySelector('h3') || {}).textContent || 'Kalou Brands'
          : 'Kalou Brands';
        media.innerHTML = '<div class="service-visual"><span>' + title + '</span></div>';
        return;
      }
      img.style.display = 'none';
    });
  });

  // Sticky header: transparent over hero, solid on scroll
  var header = document.querySelector('.site-header');
  function onScroll() {
    if (!header) return;
    header.classList.toggle('scrolled', window.scrollY > 30);
  }
  if (header) {
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  // Subtle scroll reaction for media blocks
  var mediaBlocks = document.querySelectorAll('.parallax-media');
  function updateMediaScroll() {
    var vh = window.innerHeight || 1;
    mediaBlocks.forEach(function (block) {
      var rect = block.getBoundingClientRect();
      var mid = rect.top + rect.height / 2;
      var progress = Math.max(-1, Math.min(1, (mid - vh / 2) / vh));
      var img = block.querySelector('img');
      if (!img || img.style.display === 'none') return;
      img.style.transform = 'scale(' + (1.04 + Math.abs(progress) * 0.04) + ') translateY(' + (progress * -8) + 'px)';
    });
  }
  if (mediaBlocks.length && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    updateMediaScroll();
    window.addEventListener('scroll', updateMediaScroll, { passive: true });
    window.addEventListener('resize', updateMediaScroll, { passive: true });
  }

  // Hamburger menu
  var navToggle = document.querySelector('.nav-toggle');
  var nav = document.querySelector('.nav');
  if (navToggle && nav) {
    navToggle.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      navToggle.classList.toggle('open', open);
      navToggle.setAttribute('aria-expanded', open);
    });
    nav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        nav.classList.remove('open');
        navToggle.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // Highlight active nav link
  var page = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav a').forEach(function (link) {
    if (link.getAttribute('href') === page) link.classList.add('active');
  });

  // Scroll reveal
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function (el) { observer.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('visible'); });
  }

  // Animated stat counters (elements with data-count)
  var counters = document.querySelectorAll('[data-count]');
  function animateCounter(el) {
    var target = parseInt(el.dataset.count, 10);
    var suffix = el.dataset.suffix || '';
    var duration = 1400;
    var start = performance.now();
    function tick(now) {
      var progress = Math.min((now - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(target * eased).toLocaleString() + suffix;
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  if (counters.length && 'IntersectionObserver' in window) {
    var counterObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    counters.forEach(function (el) { counterObserver.observe(el); });
  }

  // Projects page filters
  var filterButtons = document.querySelectorAll('.filter-btn');
  var projectItems = document.querySelectorAll('[data-project-item]');
  filterButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      filterButtons.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      var filter = btn.dataset.filter;
      projectItems.forEach(function (item) {
        var show = filter === 'all' || item.dataset.category === filter;
        item.style.display = show ? '' : 'none';
      });
    });
  });

  // Contact form: submit the brief to the server, which emails info@kaloubrands.com
  var form = document.getElementById('contactForm');
  if (form) {
    var status = document.getElementById('formStatus');
    var submitBtn = form.querySelector('button[type="submit"]');

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var data = new FormData(form);
      var payload = {
        name: data.get('name'),
        email: data.get('email'),
        phone: data.get('phone'),
        service: data.get('service'),
        message: data.get('message')
      };

      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending…';
      status.className = 'form-status';

      fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
        .then(function (res) { return res.json().then(function (body) { return { ok: res.ok, body: body }; }); })
        .then(function (result) {
          if (result.ok) {
            status.textContent = 'Brief received - we\'ll get back to you shortly. Thank you!';
            status.className = 'form-status success';
            form.reset();
          } else {
            throw new Error(result.body.error || 'Something went wrong.');
          }
        })
        .catch(function (err) {
          status.textContent = err.message || 'Could not send right now - please try WhatsApp or call 0700 944 414.';
          status.className = 'form-status error';
        })
        .finally(function () {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Send My Brief';
        });
    });
  }
})();
