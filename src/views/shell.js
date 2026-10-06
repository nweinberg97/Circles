import { html, cx } from '../lib/html.js';
import { icon } from '../ui/icons.js';
import { wordmark, avatar, logo, plusTag } from '../ui/components.js';
import { S, me, myCircle, isPlus, meId } from '../store.js';
import { GOALS } from '../data/goals.js';
import { leadTodos, leadCircle } from './lead.js';

function demoBar() {
  const s = S();
  const opts = [
    { v: 'member', label: 'Member', who: 'Alex' },
    { v: 'leader', label: 'Circle leader', who: 'Maya' },
    { v: 'org', label: 'Organization', who: s.org.name },
  ];
  return html`<div class="demo-bar" role="region" aria-label="Demo controls">
    <span class="demo-label"><span class="demo-dot"></span>Demo</span>
    <div class="demo-switch" role="radiogroup" aria-label="View the product as">
      ${opts.map((o) => html`<button type="button" role="radio" aria-checked="${s.persona === o.v}" class="${cx(s.persona === o.v && 'on')}" data-action="persona" data-value="${o.v}"><span class="demo-role">${o.label}</span><span class="demo-who">${o.who}</span></button>`)}
    </div>
    <button type="button" class="demo-more" data-action="demoMenu">${icon('refresh', { size: 14 })}<span>Restart</span></button>
  </div>`;
}

const NAV = {
  member: [
    { id: 'today', label: 'Today', icon: 'home' },
    { id: 'circle', label: 'My Circle', icon: 'circle' },
    { id: 'goal', label: 'My goal', icon: 'target' },
    { id: 'support', label: 'Support', icon: 'book' },
    { id: 'discover', label: 'Discover', icon: 'compass' },
  ],
  leader: [
    { id: 'today', label: 'Today', icon: 'home' },
    { id: 'circle', label: 'My Circle', icon: 'circle' },
    { id: 'lead', label: 'Lead', icon: 'megaphone' },
    { id: 'goal', label: 'My goal', icon: 'target' },
    { id: 'support', label: 'Support', icon: 'book' },
    { id: 'discover', label: 'Discover', icon: 'compass' },
  ],
};

export function appShell(view, section) {
  const s = S();
  const p = me();
  const c = myCircle();
  const g = GOALS[c?.goal || 'sleep'];
  const items = NAV[s.persona] || NAV.member;
  const tabItems = s.persona === 'leader' ? items.filter((i) => i.id !== 'discover') : items;
  const v = view && view.main !== undefined ? view : { main: view };
  const lead = s.persona === 'leader';
  return html`
    ${demoBar()}
    <div class="${cx('shell', v.rail && 'has-rail')}" style="--g:${g.hue};--g-soft:${g.soft};--g-deep:${g.deep}">
      <aside class="sidenav" aria-label="Main">
        ${wordmark()}
        <nav class="sidenav-nav">
          ${items.map((i) => html`<a class="${cx('nav-item', section === i.id && 'on')}" href="#/${i.id}" ${section === i.id ? 'aria-current="page"' : ''}>${icon(i.icon, { size: 19 })}<span>${i.label}</span>${i.id === 'lead' && leadTodos(leadCircle()).length ? html`<span class="nav-badge" title="Things that need you">${leadTodos(leadCircle()).length}</span>` : ''}</a>`)}
        </nav>
        ${c ? html`<a class="side-circle" href="#/circle" aria-label="Open ${c.name}">
          <span class="side-circle-icon" style="--g:${g.hue};--g-soft:${g.soft}">${icon(g.icon, { size: 16 })}</span>
          <span><strong>${c.name}</strong><small>${c.memberIds.length} members${lead && c.leaderId === meId() ? ' · you lead' : ''}</small></span>
        </a>` : ''}
        ${lead ? html`<a class="side-new" href="#/new-circle">${icon('plus', { size: 16 })}Start a new Circle</a>` : ''}
        <a class="${cx('side-me', section === 'you' && 'on')}" href="#/you">
          ${avatar(p, 'sm')}
          <span><strong>${p.name}</strong><small>${isPlus() ? 'Circles Plus' : 'Free membership'}</small></span>
          ${icon('right', { size: 16 })}
        </a>
      </aside>

      <header class="topbar">
        <a href="#/today" class="topbar-logo" aria-label="Today">${logo(24)}</a>
        <span class="topbar-title">${c ? c.name : 'Circles'}</span>
        <a href="#/you" class="topbar-me" aria-label="Your profile and membership">${avatar(p, 'sm')}</a>
      </header>

      <main class="main" id="main">
        <div class="content">${v.main}</div>
        ${v.rail ? html`<aside class="rail" aria-label="Coming up">${v.rail}</aside>` : ''}
      </main>

      <nav class="tabbar" aria-label="Main">
        ${tabItems.map((i) => html`<a class="${cx('tab', section === i.id && 'on')}" href="#/${i.id}" ${section === i.id ? 'aria-current="page"' : ''}>${icon(i.icon, { size: 21 })}<span>${{ 'My Circle': 'Circle', 'My goal': 'Goal' }[i.label] || i.label}</span></a>`)}
      </nav>
    </div>`;
}

const ORG_NAV = [
  { id: 'overview', label: 'Overview', icon: 'chart', href: '#/org' },
  { id: 'programs', label: 'Programs', icon: 'grid', href: '#/org/programs' },
  { id: 'circles', label: 'Circles', icon: 'circle', href: '#/org/circles' },
  { id: 'people', label: 'People & leaders', icon: 'users', href: '#/org/people' },
  { id: 'settings', label: 'Settings', icon: 'sliders', href: '#/org/settings' },
];

export function orgShell(view, section) {
  const s = S();
  const o = s.org;
  const v = view && view.main !== undefined ? view : { main: view };
  const sec = section === 'new-program' ? 'programs' : section;
  return html`
    ${demoBar()}
    <div class="shell shell-org">
      <aside class="sidenav" aria-label="Organization">
        <div class="org-brand">${wordmark()}<span class="org-for">for organizations</span></div>
        <div class="org-switch"><span class="org-logo">H</span><span><strong>${o.name}</strong><small>${o.kind} · ${o.seatsPurchased} seats</small></span></div>
        <nav class="sidenav-nav">
          ${ORG_NAV.map((i) => html`<a class="${cx('nav-item', sec === i.id && 'on')}" href="${i.href}" ${sec === i.id ? 'aria-current="page"' : ''}>${icon(i.icon, { size: 19 })}<span>${i.label}</span></a>`)}
        </nav>
        <a class="side-new" href="#/org/new-program">${icon('plus', { size: 16 })}New program</a>
        <div class="side-me side-me-static">
          <span class="av av-sm" style="--tint:#C9E4DE">${o.admin.initials}</span>
          <span><strong>${o.admin.name}</strong><small>${o.admin.role}</small></span>
        </div>
      </aside>
      <header class="topbar">
        <span class="topbar-logo">${logo(24)}</span>
        <span class="topbar-title">${o.name}</span>
        <span class="org-logo org-logo-sm">H</span>
      </header>
      <main class="main" id="main"><div class="content content-wide">${v.main}</div></main>
      <nav class="tabbar" aria-label="Organization">
        ${ORG_NAV.map((i) => html`<a class="${cx('tab', sec === i.id && 'on')}" href="${i.href}">${icon(i.icon, { size: 21 })}<span>${i.label.split(' ')[0]}</span></a>`)}
      </nav>
    </div>`;
}

export { plusTag };
