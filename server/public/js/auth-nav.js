/**
 * ============================================================================
 * Alumni Tracker — Role-Aware Dynamic Navigation & Session Controller
 * ============================================================================
 * Fetches GET /api/users/navigation on page load and renders role-specific
 * navigation menu items for:
 *   - guest       : Ana Sayfa, Mezunlar, Kariyer, Duyurular, Hakkında, Kayıt Ol, Giriş Yap
 *   - alumni      : Ana Sayfa, Mezunlar, Kariyer, Başvurularım, Duyurular, Profilim, Hakkında + Çıkış Yap
 *   - coordinator : Ana Sayfa, Mezunlar, Kariyer, İlan Ekle, Başvurular, Duyurular, Duyuru Yaz + Çıkış Yap
 *   - admin       : Ana Sayfa, Mezunlar, Kariyer, Başvurular, Duyurular, Swagger API, Yönetim Paneli + Çıkış Yap
 * ============================================================================
 */
(function initDynamicRoleNavigation() {
  const GUEST_FALLBACK_ITEMS = [
    { label: 'Ana Sayfa', href: '/' },
    { label: 'Mezunlar', href: '/users' },
    { label: 'Kariyer', href: '/jobs' },
    { label: 'Duyurular', href: '/announcements' },
    { label: 'Hakkında', href: '/about' },
    { label: 'Kayıt Ol', href: '/register', isCta: true }
  ];

  function escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function isRouteActive(href, currentPath) {
    const cleanPath = (currentPath || '/').replace(/\/+$/, '') || '/';
    const cleanHref = (href || '/').replace(/\/+$/, '') || '/';

    if (cleanHref === '/') return cleanPath === '/';
    if (cleanPath === cleanHref) return true;

    // Group sub-routes carefully so /jobs/create doesn't highlight /jobs at the same time
    if (cleanHref === '/users' && (cleanPath === '/alumni' || cleanPath === '/user')) return true;
    if (cleanHref === '/announcements' && cleanPath === '/announcement') return true;
    if (cleanHref === '/jobs' && cleanPath === '/job') return true;
    if (cleanHref === '/applications' && cleanPath === '/application') return true;

    return false;
  }

  function buildAuthSlotHtml(payload) {
    if (!payload || !payload.authenticated || !payload.user) {
      const loginActive = window.location.pathname === '/login' ? ' active' : '';
      return `<a href="/login" class="${loginActive}" style="border: 1px solid rgba(255,255,255,0.22);">Giriş Yap</a>`;
    }

    const user = payload.user;
    const shortName = String(user.name || user.email).split(' ').slice(0, 2).join(' ');
    const role = payload.role || user.userRole || 'alumni';

    return `
      <span style="font-size: 12px; font-weight: 600; color: #F1EFE6; background: rgba(255,255,255,0.1); padding: 5px 10px; border-radius: 9999px; white-space: nowrap;">
        ${escapeHtml(shortName)} <span style="color: #F8E71C;">(${escapeHtml(role)})</span>
      </span>
      <button type="button" id="navLogoutBtn" style="background: transparent; color: #F1EFE6; border: 1px solid rgba(255,255,255,0.28); padding: 6px 12px; border-radius: 9999px; font-size: 12.5px; font-weight: 600; cursor: pointer; font-family: inherit; white-space: nowrap;">
        Çıkış Yap
      </button>
    `;
  }

  async function renderDynamicNavigation() {
    const navLinks = document.getElementById('navLinks');
    if (!navLinks) return;

    let payload = { authenticated: false, role: 'guest', items: GUEST_FALLBACK_ITEMS, user: null };

    try {
      const res = await fetch('/api/users/navigation', { credentials: 'same-origin' });
      if (res.ok) {
        const json = await res.json();
        if (json && json.success && Array.isArray(json.items)) {
          payload = json;
        }
      }
    } catch (e) {
      // Keep guest fallback menu cleanly if network fails
    }

    const currentPath = window.location.pathname;
    navLinks.setAttribute('data-nav-role', payload.role || 'guest');
    window.__AUTH_STATE__ = payload;

    const itemsHtml = (payload.items || GUEST_FALLBACK_ITEMS).map((item) => {
      const classes = [];
      if (item.isCta) classes.push('nav-cta');
      if (isRouteActive(item.href, currentPath)) classes.push('active');
      const classAttr = classes.length > 0 ? ` class="${classes.join(' ')}"` : '';
      const targetAttr = item.target ? ` target="${escapeHtml(item.target)}"` : '';
      return `<li><a href="${escapeHtml(item.href)}"${classAttr}${targetAttr}>${escapeHtml(item.label)}</a></li>`;
    }).join('');

    const slotHtml = `
      <li id="navAuthSlot" style="display: inline-flex; align-items: center; gap: 6px;">
        ${buildAuthSlotHtml(payload)}
      </li>
    `;

    navLinks.innerHTML = itemsHtml + slotHtml;

    const logoutBtn = document.getElementById('navLogoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', async () => {
        logoutBtn.disabled = true;
        logoutBtn.textContent = 'Çıkılıyor...';
        try {
          await fetch('/api/users/logout', { method: 'POST', credentials: 'same-origin' });
        } catch (e) {}
        window.location.href = '/login?loggedOut=1';
      });
    }

    document.dispatchEvent(new CustomEvent('auth:ready', { detail: payload }));
  }

  window.initAuthNavbarRefresh = renderDynamicNavigation;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderDynamicNavigation);
  } else {
    renderDynamicNavigation();
  }
})();
