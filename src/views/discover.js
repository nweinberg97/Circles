import { html, cx } from '../lib/html.js';
import { icon } from '../ui/icons.js';
import { goalTag, seats, avatar, avatarStack, circleRing, emptyState } from '../ui/components.js';
import { S, set, toast, meId, person, myCircle, uid } from '../store.js';
import { GOALS, GOAL_LIST } from '../data/goals.js';
import { dayName, fmtTime } from '../lib/dates.js';
import { go } from '../lib/router.js';

const FORMATS = ['all', 'In person', 'Online', 'Hybrid'];
const TIMES = ['all', 'Mornings', 'Lunch', 'Evenings', 'Weekends'];

function circleCard(c) {
  const g = GOALS[c.goal];
  const mine = myCircle()?.id === c.id;
  const full = c.memberIds.length >= c.size;
  const req = S().requests.find((r) => r.circleId === c.id && r.uid === meId());
  return html`<a class="dc" href="#/discover/${c.id}" style="--g:${g.hue};--g-soft:${g.soft};--g-deep:${g.deep}">
    <span class="dc-top">${goalTag(c.goal)}${mine ? html`<span class="tag tag-ok">Your Circle</span>` : req ? html`<span class="tag">Requested</span>` : full ? html`<span class="tag tag-faint">Full · waitlist</span>` : ''}</span>
    <strong class="dc-name">${c.name}</strong>
    <span class="dc-goal">${c.sharedGoal}</span>
    <span class="dc-meta">${icon('calendar', { size: 14 })}${dayName(c.rhythm.dow)}s, ${fmtTime(c.rhythm.time)}<span class="dot-sep"></span>${icon(c.format === 'Online' ? 'video' : 'pin', { size: 14 })}${c.format === 'Online' ? 'Online' : c.place.split(',')[0]}</span>
    <span class="dc-foot">${avatarStack(c.memberIds, { max: 4, size: 'xs' })}<span>Led by ${person(c.leaderId).first}</span>${seats(c.memberIds.length, c.size)}</span>
  </a>`;
}

export function discoverPage() {
  const s = S();
  const f = s.ui.discover;
  const list = Object.values(s.circles).filter((c) => (f.goal === 'all' || c.goal === f.goal) && (f.format === 'all' || c.format === f.format) && (f.time === 'all' || c.time === f.time));
  const main = html`
    <header class="page-head">
      <h1>Find people working on the same thing</h1>
      <p class="muted">Circles are invite-only. Ask to join one and the leader will say hello, usually within a day.</p>
    </header>
    <div class="filters" role="group" aria-label="Filter Circles">
      <div class="chip-row">
        <button class="${cx('fchip', f.goal === 'all' && 'on')}" aria-pressed="${f.goal === 'all'}" data-action="filterDiscover" data-key="goal" data-value="all">All goals</button>
        ${GOAL_LIST.map((g) => html`<button class="${cx('fchip', f.goal === g.id && 'on')}" aria-pressed="${f.goal === g.id}" style="--g:${g.hue};--g-soft:${g.soft}" data-action="filterDiscover" data-key="goal" data-value="${g.id}">${icon(g.icon, { size: 14 })}${g.short}</button>`)}
      </div>
      <div class="filter-selects">
        <label>Meets <select data-change="filterSelect" data-key="format">${FORMATS.map((x) => html`<option value="${x}" ${f.format === x ? 'selected' : ''}>${x === 'all' ? 'Any way' : x}</option>`)}</select></label>
        <label>When <select data-change="filterSelect" data-key="time">${TIMES.map((x) => html`<option value="${x}" ${f.time === x ? 'selected' : ''}>${x === 'all' ? 'Any time' : x}</option>`)}</select></label>
      </div>
    </div>
    <div class="dc-grid">${list.map(circleCard)}</div>
    ${list.length === 0 ? emptyState({ iconName: 'compass', title: 'No Circles match yet', body: 'Try another time or format, or start one yourself. Leaders get coaching and a ready-made first month.', action: html`<button class="btn btn-outline" data-action="resetDiscover">Clear filters</button>` }) : ''}
    <section class="start-own">
      <div><h2>Don’t see your people?</h2><p>Start a Circle and invite friends, coworkers or your running club. We’ll give you an agenda, a first challenge and a coach for leaders.</p></div>
      <button class="btn btn-primary" data-action="startOwn">${icon('plus', { size: 16 })}Start a Circle</button>
    </section>`;
  return { main };
}

export function circlePreview(id) {
  const s = S();
  const c = s.circles[id];
  if (!c) { go('/discover'); return { main: '' }; }
  const g = GOALS[c.goal];
  const mine = myCircle()?.id === c.id;
  const full = c.memberIds.length >= c.size;
  const req = s.requests.find((r) => r.circleId === c.id && r.uid === meId());
  const leader = person(c.leaderId);
  const main = html`
    <a class="back" href="#/discover">${icon('arrowLeft', { size: 16 })}Discover</a>
    <header class="circle-hero" style="--g:${g.hue};--g-soft:${g.soft};--g-deep:${g.deep}">
      <div class="circle-hero-text">
        ${goalTag(c.goal)}
        <h1>${c.name}</h1>
        <p class="circle-shared">${icon('target', { size: 18 })}<span><span class="muted">Together:</span> ${c.sharedGoal}</span></p>
        <p class="about">${c.about}</p>
        <p class="circle-meta">${icon('calendar', { size: 15 })}${dayName(c.rhythm.dow)}s, ${fmtTime(c.rhythm.time)} · ${c.rhythm.mins} min ${icon(c.format === 'Online' ? 'video' : 'pin', { size: 15 })}${c.rhythm.venue || c.format}${c.place !== 'Online' ? `, ${c.place.split(',')[0]}` : ''}</p>
      </div>
      ${circleRing(c, { size: 'sm', interactive: false })}
    </header>
    <section class="card"><div class="card-head"><h2>Who’s in it</h2><span class="muted">${c.memberIds.length} of ${c.size} seats</span></div>
      <ul class="meet-list">${c.memberIds.map((m) => { const p = person(m); return html`<li>${avatar(p, 'md')}<span><strong>${m === meId() ? 'You' : p.first}${m === c.leaderId ? html` <span class="tag">Leader</span>` : ''}</strong><small>${p.focus}</small></span></li>`; })}</ul>
    </section>
    <section class="card"><div class="card-head"><h2>How they treat each other</h2></div>
      <ul class="agree-inline">${c.agreements.map((a) => html`<li><strong class="val-${a.value.toLowerCase()}">${a.value}</strong> ${a.line}</li>`)}</ul>
    </section>`;
  const rail = html`<section class="card join-card">
    ${avatar(leader, 'lg')}
    <h2>${mine ? 'This is your Circle' : req ? `Request sent to ${leader.first}` : full ? 'This Circle is full' : `Ask ${leader.first} to join`}</h2>
    ${mine ? html`<a class="btn btn-primary wide" href="#/circle">Go to your Circle</a>`
      : req ? html`<p class="muted">${leader.first} usually replies within a day. We’ll let you know.</p><button class="btn btn-sm btn-link" data-action="cancelRequest" data-id="${c.id}">Withdraw request</button>`
      : html`<form data-submit="requestJoin" data-id="${c.id}" class="join-form">
          <label class="field"><span class="field-label">Say hello and why you’re interested</span><textarea name="note" rows="3" placeholder="Hi ${leader.first}! I’m working on…"></textarea></label>
          <button class="btn btn-primary wide" type="submit">${full ? 'Join the waitlist' : 'Ask to join'}</button>
          <p class="muted small">${full ? 'Circles stay at 5–7 so everyone is known. When the waitlist grows, leaders often start a sister Circle.' : 'You can belong to more than one Circle.'}</p>
        </form>`}
  </section>`;
  return { main, rail };
}

export const discoverActions = {
  filterDiscover(el) { set((s) => { s.ui.discover[el.dataset.key] = el.dataset.value; }); },
  filterSelect(el) { set((s) => { s.ui.discover[el.dataset.key] = el.value; }); },
  resetDiscover() { set((s) => { s.ui.discover = { goal: 'all', format: 'all', time: 'all' }; }); },
  requestJoin(form, fd) {
    const id = form.dataset.id;
    set((s) => { s.requests.push({ id: uid('rq'), circleId: id, uid: meId(), note: (fd.get('note') || '').toString(), at: Date.now() }); });
    toast(`Request sent to ${person(S().circles[id].leaderId).first}`);
  },
  cancelRequest(el) { set((s) => { s.requests = s.requests.filter((r) => !(r.circleId === el.dataset.id && r.uid === meId())); }); },
  startOwn() {
    const s = S();
    if (s.persona === 'leader') { go('/new-circle'); return; }
    set((st) => { st.persona = 'leader'; }, { render: false });
    toast('Switched to the leader view to start a Circle');
    go('/new-circle');
  },
};
