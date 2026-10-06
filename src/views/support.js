import { html, cx } from '../lib/html.js';
import { icon } from '../ui/icons.js';
import { plusTag, expertAvatar, avatarStack, plusLock, goalTag, avatar } from '../ui/components.js';
import { S, set, toast, meId, myCircle, myGoal, isPlus, openModal, uid, person } from '../store.js';
import { GOALS, GOAL_LIST } from '../data/goals.js';
import { GUIDES, WORKSHOPS, EXPERTS, RESOURCES, byGoal } from '../data/support.js';
import { nextWeekday, relDay, fmtTime, fmtDate } from '../lib/dates.js';
import { go } from '../lib/router.js';

export function supportGoal() {
  const s = S();
  return GOALS[s.ui.supportGoal || myGoal()?.goal || myCircle()?.goal || 'sleep'];
}

function goalSwitcher(g) {
  const mine = myGoal()?.goal;
  return html`<div class="goal-switch">
    <label for="sg" class="muted">Support for</label>
    <select id="sg" data-change="setSupportGoal">${GOAL_LIST.map((x) => html`<option value="${x.id}" ${x.id === g.id ? 'selected' : ''}>${x.name}${x.id === mine ? ' (your goal)' : ''}</option>`)}</select>
  </div>`;
}

function tabs(active) {
  const t = [
    { id: '', label: 'Learn', icon: 'book' },
    { id: 'experts', label: 'Experts & live', icon: 'video' },
    { id: 'resources', label: 'Recommended', icon: 'star' },
  ];
  return html`<nav class="tabs" aria-label="Support sections">${t.map((x) => html`<a class="${cx('tab-link', active === x.id && 'on')}" href="#/support${x.id ? '/' + x.id : ''}" ${active === x.id ? 'aria-current="page"' : ''}>${icon(x.icon, { size: 16 })}${x.label}</a>`)}</nav>`;
}

function guideCard(gd, plus) {
  const e = EXPERTS[gd.by];
  const locked = gd.plus && !plus;
  return html`<a class="${cx('guide', gd.kind === 'Program' && 'is-program')}" href="#/support/guide/${gd.id}">
    <span class="guide-kind">${gd.kind}${gd.weeks ? ` · ${gd.weeks} weeks` : ` · ${gd.mins} min`}${locked ? plusTag() : ''}</span>
    <strong>${gd.title}</strong>
    <span class="guide-sum">${gd.summary}</span>
    <span class="guide-by">${expertAvatar(gd.by, 'xs')}${e.name}</span>
  </a>`;
}

function workshopRow(w, plus) {
  const s = S();
  const e = EXPERTS[w.expert];
  const d = nextWeekday(w.dow, w.time);
  const reg = s.support.registered[meId()]?.[w.id];
  return html`<li class="workshop">
    <div class="ws-date"><span>${relDay(d)}</span><strong>${fmtTime(w.time)}</strong><small>${w.mins} min</small></div>
    <div class="ws-body"><strong>${w.title}</strong><p>${w.blurb}</p><span class="ws-by">${expertAvatar(w.expert, 'xs')}${e.name} · ${e.role}</span></div>
    <div class="ws-act">
      ${plus ? html`<button class="${cx('btn btn-sm', reg ? 'btn-soft on' : 'btn-primary')}" data-action="registerWorkshop" data-id="${w.id}">${reg ? html`${icon('check', { size: 14 })}Saved your seat` : 'Save my seat'}</button>` : html`<button class="btn btn-sm btn-plus" data-action="openPlus">${icon('lock', { size: 13 })}Join with Plus</button>`}
      <small class="muted">${w.attending + (reg ? 1 : 0)} going${w.replay ? ' · replay' : ''}</small>
    </div>
  </li>`;
}

function resourceRow(r, c, plus) {
  const tried = c ? r.circleTried.filter((u) => c.memberIds.includes(u)) : [];
  return html`<li><button class="res" data-action="openResource" data-id="${r.id}">
    <span class="res-type">${r.type}</span>
    <span class="res-main"><strong>${r.name}</strong><span class="res-tag">${r.tagline}</span><span class="res-why">${r.why}</span>
      <span class="res-signals">
        ${r.expertPick ? html`<span class="sig">${expertAvatar(r.expertPick, 'xs')}${EXPERTS[r.expertPick].name.split(',')[0]}’s pick</span>` : ''}
        <span class="sig">${icon('star', { size: 13 })}${r.tested.score} from ${r.tested.n} members</span>
        ${tried.length ? html`<span class="sig">${avatarStack(tried, { size: 'xs' })}Tried in your Circle</span>` : ''}
      </span>
    </span>
    <span class="res-side"><span class="res-price">${r.price}</span>
      ${r.partner ? html`<span class="disclose">${icon('info', { size: 12 })}Partner</span>` : html`<span class="disclose is-indie">No affiliation</span>`}
      ${r.perk ? html`<span class="${cx('perk', !plus && 'is-locked')}">${plus ? '' : icon('lock', { size: 11 })}${r.perk}</span>` : ''}
    </span>
  </button></li>`;
}

export function supportPage(tab = '') {
  const s = S();
  const g = supportGoal();
  const plus = isPlus();
  const c = myCircle();
  let body;
  if (tab === 'experts') {
    const ws = byGoal(WORKSHOPS, g.id).concat(WORKSHOPS.filter((w) => w.goal !== g.id && w.goal === 'nutrition' && g.id === 'sleep'));
    const experts = [...new Set(ws.map((w) => w.expert).concat(byGoal(GUIDES, g.id).map((x) => x.by)))];
    body = html`
      <section aria-labelledby="ws-h"><div class="sec-head"><h2 id="ws-h">Live this week</h2><span class="muted">Small enough to ask questions</span></div>
        <ul class="workshops">${ws.map((w) => workshopRow(w, plus))}</ul></section>
      <section class="ask-grid" aria-label="One-to-one help">
        <form class="card ask" data-submit="askExpert">
          <h2>${icon('message', { size: 18 })}Ask an expert</h2>
          <p class="muted">Answered by a ${g.short.toLowerCase()} specialist within a day. Private to you.</p>
          ${plus ? html`<textarea name="q" rows="3" placeholder="e.g. I fall asleep fine but wake at 3 AM. What should I try first?" aria-label="Your question"></textarea><button class="btn btn-primary btn-sm" type="submit">Send question</button>` : html`<button type="button" class="btn btn-plus btn-sm" data-action="openPlus">${icon('lock', { size: 13 })}Included with Plus</button>`}
          ${(s.support.questions || []).filter((q) => q.uid === meId()).map((q) => html`<div class="asked"><p><strong>You asked:</strong> ${q.text}</p><p class="muted">${icon('clock', { size: 13 })}${EXPERTS[q.expert].name} will reply by tomorrow evening.</p></div>`)}
        </form>
        <div class="card ask">
          <h2>${icon('phone', { size: 18 })}15-minute coaching call</h2>
          <p class="muted">One a month with Plus. Bring your week; leave with one thing to change.</p>
          ${plus ? (s.support.bookings.find((b) => b.uid === meId()) ? html`<div class="asked">${icon('check', { size: 15 })}<p><strong>Booked:</strong> ${s.support.bookings.find((b) => b.uid === meId()).label}</p></div>` : html`<div class="slots">${['Thu 12:15 PM', 'Thu 5:30 PM', 'Fri 8:00 AM', 'Mon 7:45 PM'].map((sl) => html`<button class="slot" data-action="bookCall" data-value="${sl}">${sl}</button>`)}</div>`) : html`<button class="btn btn-plus btn-sm" data-action="openPlus">${icon('lock', { size: 13 })}Included with Plus</button>`}
        </div>
      </section>
      <section aria-labelledby="ex-h"><div class="sec-head"><h2 id="ex-h">The experts behind your goal</h2></div>
        <ul class="expert-list">${experts.map((id) => { const e = EXPERTS[id]; return html`<li>${expertAvatar(id, 'lg')}<div><strong>${e.name}</strong><span class="muted">${e.role}</span><p>${e.bio}</p></div></li>`; })}</ul>
      </section>`;
  } else if (tab === 'resources') {
    const filter = s.ui.partnersOnly || 'all';
    let list = byGoal(RESOURCES, g.id);
    if (filter === 'indie') list = list.filter((r) => !r.partner);
    list = list.sort((a, b) => (b.expertPick ? 1 : 0) - (a.expertPick ? 1 : 0) || b.tested.score - a.tested.score);
    body = html`
      <section class="how-choose">
        ${icon('shield', { size: 20 })}
        <div><strong>How we choose</strong><p>Everything here is reviewed by our ${g.short.toLowerCase()} experts and rated by members working on the same goal. Some brands pay us a commission; we label them, and it never changes the order.</p></div>
        <button class="btn btn-sm btn-link" data-action="openHowWeChoose">Read the policy</button>
      </section>
      <div class="filter-row">
        <div class="seg">${[{ v: 'all', l: 'Everything' }, { v: 'indie', l: 'Independent only' }].map((o) => html`<button class="${cx('seg-btn', filter === o.v && 'on')}" aria-pressed="${filter === o.v}" data-action="setPartnerFilter" data-value="${o.v}">${o.l}</button>`)}</div>
        <span class="muted">${list.length} picks for ${g.name.toLowerCase()}</span>
      </div>
      <ul class="res-list">${list.map((r) => resourceRow(r, c, plus))}</ul>`;
  } else {
    const all = byGoal(GUIDES, g.id);
    const program = all.find((x) => x.kind === 'Program');
    const guides = all.filter((x) => x !== program);
    body = html`
      ${program ? html`<a class="program" href="#/support/guide/${program.id}" style="--g:${g.hue};--g-soft:${g.soft};--g-deep:${g.deep}">
        <span class="program-icon">${icon(g.icon, { size: 28 })}</span>
        <span class="program-body"><span class="guide-kind">Program · ${program.weeks} weeks ${!plus ? plusTag() : ''}</span><strong>${program.title}</strong><span>${program.summary}</span>
        <span class="program-weeks">${program.body.map((w) => html`<span>${w}</span>`)}</span></span>
        <span class="program-go">${icon('arrowRight')}</span>
      </a>` : ''}
      <section aria-labelledby="gd-h"><div class="sec-head"><h2 id="gd-h">Guides</h2><span class="muted">Short, practical, written by the experts</span></div>
        <div class="guides">${guides.map((x) => guideCard(x, plus))}</div>
      </section>`;
  }
  const main = html`
    <header class="page-head support-head" style="--g:${g.hue};--g-soft:${g.soft};--g-deep:${g.deep}">
      <div class="support-title">${goalTag(g.id)}${goalSwitcher(g)}</div>
      <h1>Support for ${g.name.toLowerCase()}</h1>
      <p class="muted">The best of what helps, picked for people working on the same thing as your Circle.</p>
    </header>
    ${tabs(tab || '')}
    ${body}`;
  const rail = html`
    ${!plus ? plusLock({ title: 'Go deeper with Plus', body: 'Live workshops, the full program library, Ask an expert and a monthly coaching call. $5 a month.' }) : html`<section class="card plus-on">${plusTag('Circles Plus')}<p>You have everything here unlocked.</p><a class="link" href="#/you">Manage membership</a></section>`}
    <section class="card"><div class="card-head"><h2>Need a person, now?</h2></div><p class="muted">Our support team answers email around the clock.</p><button class="btn btn-sm btn-outline wide" data-action="emailSupport">${icon('mail', { size: 14 })}Email support</button></section>`;
  return { main, rail };
}

export function guidePage(id) {
  const gd = GUIDES.find((x) => x.id === id);
  if (!gd) { go('/support'); return { main: '' }; }
  const g = GOALS[gd.goal];
  const e = EXPERTS[gd.by];
  const locked = gd.plus && !isPlus();
  const saved = S().support.saved[gd.id];
  const main = html`
    <a class="back" href="#/support">${icon('arrowLeft', { size: 16 })}Support</a>
    <article class="reader" style="--g:${g.hue};--g-soft:${g.soft};--g-deep:${g.deep}">
      <p class="guide-kind">${gd.kind} · ${gd.weeks ? `${gd.weeks} weeks` : `${gd.mins} min read`} ${gd.plus ? plusTag() : ''}</p>
      <h1>${gd.title}</h1>
      <p class="reader-by">${expertAvatar(gd.by, 'sm')}<span><strong>${e.name}</strong><small>${e.role}</small></span></p>
      <p class="reader-lede">${gd.summary}</p>
      ${(locked ? gd.body.slice(0, 1) : gd.body).map((p) => html`<p>${p}</p>`)}
      ${locked ? html`<div class="reader-fade"></div>${plusLock({ title: 'Keep reading with Plus', body: `The rest of this ${gd.kind.toLowerCase()} — and everything else in the ${g.short.toLowerCase()} library — is part of Circles Plus.`, cta: 'Unlock for $5/month' })}` : html`
        <div class="reader-actions">
          <button class="${cx('btn btn-sm', saved ? 'btn-soft on' : 'btn-outline')}" data-action="saveGuide" data-id="${gd.id}">${saved ? html`${icon('check', { size: 14 })}Saved` : 'Save for later'}</button>
          <button class="btn btn-sm btn-primary" data-action="shareGuide" data-id="${gd.id}">${icon('send', { size: 14 })}Share with my Circle</button>
        </div>`}
    </article>`;
  return { main };
}

export const supportActions = {
  setSupportGoal(el) { set((s) => { s.ui.supportGoal = el.value === myGoal()?.goal ? null : el.value; }); },
  setPartnerFilter(el) { set((s) => { s.ui.partnersOnly = el.dataset.value; }); },
  registerWorkshop(el) {
    let on;
    set((s) => { const r = (s.support.registered[meId()] = s.support.registered[meId()] || {}); r[el.dataset.id] = !r[el.dataset.id]; on = r[el.dataset.id]; });
    toast(on ? 'Seat saved. We’ll send the link an hour before.' : 'Seat released');
  },
  askExpert(form, fd) {
    const q = (fd.get('q') || '').toString().trim();
    if (!q) { toast('Write your question first'); return; }
    const g = supportGoal();
    const expert = byGoal(GUIDES, g.id)[0]?.by || 'lena';
    set((s) => { s.support.questions.push({ id: uid('q'), uid: meId(), text: q, expert }); });
    toast('Question sent');
  },
  bookCall(el) {
    set((s) => { s.support.bookings.push({ uid: meId(), label: `${el.dataset.value} with a ${supportGoal().short.toLowerCase()} coach` }); });
    toast('Call booked. Calendar invite on its way.');
  },
  openHowWeChoose() { openModal('howWeChoose'); },
  saveGuide(el) { set((s) => { s.support.saved[el.dataset.id] = !s.support.saved[el.dataset.id]; }); },
  shareGuide(el) {
    const gd = GUIDES.find((x) => x.id === el.dataset.id);
    const c = myCircle();
    set((s) => { s.posts.unshift({ id: uid('p'), circleId: c.id, uid: meId(), type: 'update', at: Date.now(), text: `Found this useful: “${gd.title}” by ${EXPERTS[gd.by].name}. ${gd.summary}`, cheers: [], metoo: [], replies: [] }); });
    toast('Shared to your Circle');
  },
  emailSupport() { toast('Opens your email to support@circles.app'); },
};

void fmtDate; void avatar; void person;
