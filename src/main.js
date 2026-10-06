import { html } from './lib/html.js';
import { route, go, setRenderer } from './lib/router.js';
import { initStore, S, set, resetDemo, toast, openModal, closeModal } from './store.js';
import { appShell, orgShell } from './views/shell.js';
import { landing } from './views/landing.js';
import { onboarding, onboardingActions } from './views/onboarding.js';
import { today, todayActions } from './views/today.js';
import { circleHome, meetingPage, circleActions } from './views/circle.js';
import { goalPage, goalActions } from './views/goal.js';
import { supportPage, guidePage, supportActions } from './views/support.js';
import { discoverPage, circlePreview, discoverActions } from './views/discover.js';
import { youPage, youActions } from './views/you.js';
import { leadPage, leadActions } from './views/lead.js';
import { newCirclePage, newCircleActions } from './views/newcircle.js';
import { orgPage, orgActions } from './views/org.js';
import { renderModal, modalActions } from './views/modals.js';

const root = document.getElementById('app');


function pageFor({ parts }) {
  const [a, b, c] = parts;
  const s = S();
  if (!a) return { bare: landing() };
  if (a === 'join') return { bare: onboarding() };
  if (a === 'org') {
    if (s.persona !== 'org') s.persona = 'org';
    return { org: orgPage(b, c), section: b || 'overview' };
  }
  if (s.persona === 'org') s.persona = 'member';
  if (s.persona === 'member' && !s.onboarded) return { bare: onboarding() };
  const views = {
    today: () => today(),
    circle: () => (b === 'meeting' ? meetingPage() : circleHome(b)),
    goal: () => goalPage(),
    support: () => (b === 'guide' ? guidePage(c) : supportPage(b)),
    discover: () => (b ? circlePreview(b) : discoverPage()),
    you: () => youPage(),
    lead: () => leadPage(b),
    'new-circle': () => newCirclePage(),
  };
  const v = views[a] || views.today;
  return { app: v(), section: a };
}

let lastPath = null;
function render() {
  const r = route();
  const active = document.activeElement;
  const focusKey = active?.dataset?.focus || (active?.id && active.matches('input,textarea,select') ? active.id : null);
  const selStart = active?.selectionStart;

  const page = pageFor(r);
  const s = S();
  let body;
  if (page.bare) body = page.bare;
  else if (page.org) body = orgShell(page.org, page.section);
  else body = appShell(page.app, page.section);

  root.innerHTML = String(html`${body}${renderModal(s.ui.modal)}${s.ui.toast ? html`<div class="toast" role="status">${s.ui.toast.text}</div>` : ''}`);
  document.body.classList.toggle('modal-open', !!s.ui.modal);

  if (lastPath !== r.path) {
    window.scrollTo(0, 0);
    lastPath = r.path;
    const h1 = root.querySelector('main h1');
    if (h1 && document.activeElement === document.body) { h1.setAttribute('tabindex', '-1'); }
  } else if (focusKey) {
    const el = root.querySelector(`[data-focus="${focusKey}"]`) || document.getElementById(focusKey);
    if (el) { el.focus(); try { if (selStart != null) el.setSelectionRange(selStart, selStart); } catch { /* not a text input */ } }
  }
  if (s.ui.modal) {
    const first = root.querySelector('.modal [autofocus], .modal input, .modal textarea, .modal button');
    if (first && !root.querySelector('.modal').contains(document.activeElement)) first.focus();
  }
}

// ---------- Global actions ----------
const globalActions = {
  persona(el) {
    const p = el.dataset.value;
    set((s) => { s.persona = p; s.ui.modal = null; }, { render: false });
    go(p === 'org' ? '/org' : p === 'leader' ? '/lead' : '/today');
  },
  restartFresh() {
    resetDemo({ fresh: true });
    go('/join');
  },
  restoreDemo() {
    resetDemo({ fresh: false });
    go('/today');
    toast('Demo data restored');
  },
  startAs(el) {
    const p = el.dataset.value;
    if (p === 'fresh') { resetDemo({ fresh: true }); go('/join'); return; }
    if (S().mode === 'fresh' && !S().onboarded) resetDemo({ fresh: false });
    set((s) => { s.persona = p; }, { render: false });
    go(p === 'org' ? '/org' : p === 'leader' ? '/lead' : '/today');
  },
  nav(el) { go(el.dataset.to); },
  closeModal() { closeModal(); },
  openPlus() { openModal('plus'); },
  openMember(el) { openModal('member', { id: el.dataset.id }); },
  demoMenu() { openModal('demo'); },
  noop() {},
};

const actions = Object.assign({}, globalActions, onboardingActions, todayActions, circleActions, goalActions, supportActions, discoverActions, youActions, leadActions, newCircleActions, orgActions, modalActions);

document.addEventListener('click', (e) => {
  const el = e.target.closest('[data-action]');
  if (!el || el.disabled) return;
  if (el.dataset.action === 'noop') return;
  if (el.dataset.self && e.target !== el) return;
  const fn = actions[el.dataset.action];
  if (!fn) { console.warn('No action', el.dataset.action); return; }
  e.preventDefault();
  fn(el, e);
});

document.addEventListener('submit', (e) => {
  const form = e.target.closest('form[data-submit]');
  if (!form) return;
  e.preventDefault();
  const fn = actions[form.dataset.submit];
  if (fn) fn(form, new FormData(form));
});

// data-bind: write input values into state without re-rendering (keeps typing smooth)
document.addEventListener('input', (e) => {
  const el = e.target;
  if (el.dataset.bind) {
    set((s) => {
      const path = el.dataset.bind.split('.');
      let o = s;
      for (let i = 0; i < path.length - 1; i++) o = o[path[i]] ??= {};
      o[path[path.length - 1]] = el.type === 'checkbox' ? el.checked : el.value;
    }, { render: false });
    if (el.dataset.live) render();
  }
  if (el.dataset.onInput && actions[el.dataset.onInput]) actions[el.dataset.onInput](el, e);
});

document.addEventListener('change', (e) => {
  const el = e.target;
  if (el.dataset.change && actions[el.dataset.change]) actions[el.dataset.change](el, e);
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && S().ui.modal) closeModal();
});

window.addEventListener('hashchange', () => { if (S().ui.modal) S().ui.modal = null; render(); });

setRenderer(render);
initStore(render);
render();
