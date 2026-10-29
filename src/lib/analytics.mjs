import config from '../../content/analytics.json' with { type: 'json' };

const sections = ['about', 'experience', 'research', 'education', 'awards'];
const campaignKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];

// Keep attribution channels while dropping unknown queries, hashes and identifiers.
export function safePageUrl(value) {
  const url = new URL(value);
  const safe = new URL(url.origin + url.pathname);
  for (const key of campaignKeys) {
    const value = url.searchParams.get(key);
    if (value && /^[a-zA-Z0-9_. -]{1,80}$/.test(value)) safe.searchParams.set(key, value);
  }
  return safe.href;
}
export function safeReferrer(value) {
  try {
    return new URL(value).origin + '/';
  } catch {
    return '';
  }
}
export function clickTarget(anchor) {
  const href = anchor.getAttribute('href') || '';
  if (href.startsWith('mailto:')) return { name: 'contact_click', target_kind: 'email' };
  if (href.startsWith('tel:')) return { name: 'contact_click', target_kind: 'phone' };
  if (/^\/downloads\/jaeyong-lee-resume-(ko|en)\.pdf$/.test(href)) {
    return {
      name: 'resume_download_click',
      target_kind: href.includes('-ko.pdf') ? 'pdf_ko' : 'pdf_en',
    };
  }
  const paper = anchor.closest('[data-research]');
  if (paper && /^https:\/\/(doi\.org|link\.springer\.com)\//.test(href)) {
    return { name: 'paper_click', target_kind: paper.getAttribute('data-research') };
  }
  try {
    const host = new URL(href).hostname;
    const kind =
      host === 'www.linkedin.com'
        ? 'linkedin'
        : host === 'scholar.google.com'
          ? 'scholar'
          : host === 'github.com'
            ? 'github'
            : null;
    return kind ? { name: 'profile_link_click', target_kind: kind } : null;
  } catch {
    return null;
  }
}

export function initAnalytics() {
  // Production output can be previewed locally. Never contact GA on those hosts,
  // print/compose pages, the language gateway or automated production browsers.
  if (
    location.hostname !== config.hostname ||
    location.protocol !== 'https:' ||
    navigator.webdriver ||
    document.documentElement.dataset.page !== 'profile' ||
    !/^\/(ko|en)\/$/.test(location.pathname)
  )
    return;
  const panel = document.querySelector('[data-analytics-panel]');
  const settings = document.querySelector('[data-analytics-settings]');
  if (!panel || !settings) return;
  const lang = document.documentElement.lang;
  let granted = false;
  let choice = null;
  let initialized = false;
  let returnFocus;
  let stopTracking = () => {};
  const gtag = (...args) => window.gtag?.(...args);
  function readChoice() {
    try {
      const value = JSON.parse(localStorage.getItem(config.consentKey));
      return value &&
        ['granted', 'denied'].includes(value.value) &&
        Date.now() - value.at >= 0 &&
        Date.now() - value.at < config.consentDays * 86400000
        ? value.value
        : null;
    } catch {
      return null;
    }
  }
  function syncChoice() {
    panel
      .querySelectorAll('[data-analytics-choice]')
      .forEach((button) =>
        button.setAttribute('aria-pressed', String(button.dataset.analyticsChoice === choice)),
      );
  }
  function clearCookies() {
    for (const cookie of document.cookie.split(';')) {
      const name = cookie.trim().split('=')[0];
      if (!/^_ga(?:_|$)/.test(name)) continue;
      for (const domain of ['', `;domain=${config.hostname}`]) {
        document.cookie = `${name}=;Max-Age=0;path=/${domain};Secure;SameSite=Lax`;
      }
    }
  }
  function start() {
    if (initialized) return;
    initialized = true;
    granted = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () {
      window.dataLayer.push(arguments);
    };
    window[`ga-disable-${config.measurementId}`] = false;
    gtag('consent', 'default', {
      analytics_storage: 'denied',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
    });
    gtag('consent', 'update', { analytics_storage: 'granted' });
    gtag('js', new Date());
    gtag('config', config.measurementId, {
      send_page_view: false,
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
      cookie_domain: config.hostname,
      cookie_expires: config.cookieDays * 86400,
      page_location: safePageUrl(location.href),
      page_referrer: safeReferrer(document.referrer),
    });
    const tag = document.createElement('script');
    tag.async = true;
    tag.src = `https://www.googletagmanager.com/gtag/js?id=${config.measurementId}`;
    tag.dataset.resumeGoogleTag = '';
    document.head.append(tag);
    const emit = (name, props = {}) => {
      if (!granted) return;
      gtag('event', name, {
        send_to: config.measurementId,
        page_language: lang,
        ...props,
      });
    };
    emit('page_view', {
      page_location: safePageUrl(location.href),
      page_referrer: safeReferrer(document.referrer),
      page_title: document.title,
    });
    stopTracking = trackEngagement(emit);
  }
  function choose(value) {
    choice = value;
    syncChoice();
    try {
      localStorage.setItem(config.consentKey, JSON.stringify({ value, at: Date.now() }));
    } catch {}
    panel.hidden = true;
    if (returnFocus) returnFocus.focus();
    if (value === 'granted') start();
    else {
      granted = false;
      stopTracking();
      window[`ga-disable-${config.measurementId}`] = true;
      clearCookies();
      // A fresh denied page never loads the Google tag, including its automatic events.
      if (initialized) location.reload();
    }
  }
  settings.hidden = false;
  settings.addEventListener('click', () => {
    returnFocus = settings;
    panel.hidden = false;
    panel.querySelector('button')?.focus();
  });
  panel
    .querySelectorAll('[data-analytics-choice]')
    .forEach((button) => button.addEventListener('click', () => choose(button.dataset.analyticsChoice)));
  panel.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      panel.hidden = true;
      returnFocus?.focus();
    }
  });
  window.addEventListener('storage', (event) => {
    if (event.key !== config.consentKey || readChoice() === choice) return;
    granted = false;
    stopTracking();
    window[`ga-disable-${config.measurementId}`] = true;
    location.reload();
  });
  choice = readChoice();
  syncChoice();
  if (choice === 'granted') start();
  else if (!choice) panel.hidden = false;
}

export function trackEngagement(emit) {
  const nodes = sections.map((id) => document.getElementById(id)).filter(Boolean);
  const reached = new Set();
  const depths = new Set();
  let current = null;
  const exposure = new Map();
  let visiblePreviously = [];
  let pending = 0;
  let last = performance.now();
  let raf = 0;
  let stopped = false;
  const active = () => document.visibilityState === 'visible' && document.hasFocus();
  function visibleSections() {
    const top = document.querySelector('.site-header')?.getBoundingClientRect().bottom || 0;
    const visibleNodes = [];
    for (const node of nodes) {
      const rect = node.getBoundingClientRect();
      const visible = Math.max(0, Math.min(rect.bottom, innerHeight) - Math.max(rect.top, top));
      if (visible >= Math.min(120, innerHeight * 0.2, rect.height * 0.25))
        visibleNodes.push({ id: node.id, visible });
    }
    return visibleNodes.sort((a, b) => b.visible - a.visible);
  }
  function flush() {
    if (current && reached.has(current) && pending >= 250) {
      emit('section_engagement', { section_id: current, visible_seconds: Math.round(pending) / 1000 });
    }
    pending = 0;
  }
  let wasActive = active();
  function tick() {
    if (stopped) return;
    const now = performance.now();
    if (wasActive) {
      const elapsed = now - last;
      for (const id of visiblePreviously) {
        const duration = (exposure.get(id) || 0) + elapsed;
        exposure.set(id, duration);
        if (!reached.has(id) && duration >= config.sectionViewMs) {
          reached.add(id);
          emit('section_view', { section_id: id });
        }
      }
      if (current) pending += elapsed;
    }
    last = now;
    const visible = active() ? visibleSections() : [];
    const next = visible[0]?.id || null;
    const ids = visible.map((node) => node.id);
    for (const id of visiblePreviously) if (!ids.includes(id)) exposure.delete(id);
    visiblePreviously = ids;
    if (next !== current) {
      flush();
      current = next;
    }
    wasActive = active();
    if (wasActive) {
      const depth = ((scrollY + innerHeight) / document.documentElement.scrollHeight) * 100;
      for (const percent of [25, 50, 75, 90])
        if (depth >= percent && !depths.has(percent)) {
          depths.add(percent);
          emit('scroll_depth', { scroll_percent: percent });
        }
    }
  }
  const onScroll = () => {
    if (!raf)
      raf = requestAnimationFrame(() => {
        raf = 0;
        tick();
      });
  };
  const onHidden = () => {
    tick();
    flush();
  };
  const onPageHide = () => {
    onHidden();
    wasActive = false;
    visiblePreviously = [];
    current = null;
    exposure.clear();
  };
  const onPageShow = () => {
    last = performance.now();
    tick();
  };
  const onClick = (event) => {
    const link = event.target instanceof Element ? event.target.closest('a') : null;
    const target = link && clickTarget(link);
    if (target) {
      const { name, ...props } = target;
      tick();
      emit(name, props);
    }
  };
  tick();
  const interval = setInterval(tick, 1000);
  const heartbeat = setInterval(() => {
    tick();
    flush();
  }, config.heartbeatMs);
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  document.addEventListener('visibilitychange', onHidden);
  window.addEventListener('focus', tick);
  window.addEventListener('blur', onHidden);
  window.addEventListener('pagehide', onPageHide);
  window.addEventListener('pageshow', onPageShow);
  document.addEventListener('click', onClick);
  return () => {
    stopped = true;
    clearInterval(interval);
    clearInterval(heartbeat);
    cancelAnimationFrame(raf);
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('resize', onScroll);
    document.removeEventListener('visibilitychange', onHidden);
    window.removeEventListener('focus', tick);
    window.removeEventListener('blur', onHidden);
    window.removeEventListener('pagehide', onPageHide);
    window.removeEventListener('pageshow', onPageShow);
    document.removeEventListener('click', onClick);
  };
}
