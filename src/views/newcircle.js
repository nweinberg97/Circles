import { html, cx } from '../lib/html.js';
import { icon } from '../ui/icons.js';
import { avatar, goalTag, seats } from '../ui/components.js';
import { S, set, toast, meId, person, uid } from '../store.js';
import { GOALS, GOAL_LIST } from '../data/goals.js';
import { dayName, fmtTime } from '../lib/dates.js';
import { go } from '../lib/router.js';

const STEPS = ['Goal', 'Basics', 'Rhythm', 'Challenge', 'People'];

function nc() {
  const s = S();
  const sister = (location.hash.split('?')[1] || '').match(/sister=([\w_]+)/)?.[1];
  if (!s.nc || (sister && s.nc.sister !== sister)) {
    const src = sister && s.circles[sister];
    s.nc = src ? {
      step: 1, sister, goal: src.goal, name: `${src.name.split(' — ')[0]} — ${src.place.split(',')[0]} II`, sharedGoal: src.sharedGoal, size: 7,
      dow: 3, time: '19:30', format: 'Hybrid', venue: src.rhythm.venue || '', challenge: GOALS[src.goal].challenges[0].id, invites: [...(src.waitlist || [])], emails: '',
    } : { step: 0, goal: 'sleep', name: '', sharedGoal: '', size: 6, dow: 0, time: '10:00', format: 'In person', venue: '', challenge: null, invites: [], emails: '' };
  }
  return s.nc;
}

export function newCirclePage() {
  const s = S();
  if (s.persona !== 'leader') { s.persona = 'leader'; }
  const o = nc();
  const g = GOALS[o.goal];
  let body;
  if (o.step === 0) {
    body = html`<h2>What will this Circle work on?</h2>
      <div class="goal-pick">${GOAL_LIST.map((x) => html`<button type="button" class="${cx('goal-opt', o.goal === x.id && 'on')}" aria-pressed="${o.goal === x.id}" style="--g:${x.hue};--g-soft:${x.soft};--g-deep:${x.deep}" data-action="ncSet" data-key="goal" data-value="${x.id}"><span class="goal-opt-icon">${icon(x.icon, { size: 22 })}</span><strong>${x.name}</strong><span>${x.pitch}</span></button>`)}</div>`;
  } else if (o.step === 1) {
    body = html`<h2>Name it and set the shared goal</h2>
      <label class="field"><span class="field-label">Circle name</span><input data-bind="nc.name" data-focus="nc-name" value="${o.name}" placeholder="${g.short} — your neighbourhood"/></label>
      <label class="field"><span class="field-label">What you’re working toward together</span><input data-bind="nc.sharedGoal" data-focus="nc-goal" value="${o.sharedGoal}" placeholder="${g.successIdeas[1] || g.successIdeas[0]}"/><span class="field-hint">Measurable and shared. Everyone still sets their own habits.</span></label>
      <fieldset class="field"><legend class="field-label">Size</legend><div class="seg">${[5, 6, 7].map((n) => html`<button type="button" class="${cx('seg-btn', o.size === n && 'on')}" aria-pressed="${o.size === n}" data-action="ncSet" data-key="size" data-value="${n}">${n} people</button>`)}</div><span class="field-hint">Small enough that everyone notices when you’re missing.</span></fieldset>`;
  } else if (o.step === 2) {
    body = html`<h2>Set the rhythm</h2>
      <div class="form-grid">
        <label class="field"><span class="field-label">Day</span><select data-change="ncSelect" data-key="dow">${[0, 1, 2, 3, 4, 5, 6].map((d) => html`<option value="${d}" ${o.dow === d ? 'selected' : ''}>${dayName(d)}</option>`)}</select></label>
        <label class="field"><span class="field-label">Time</span><input type="time" value="${o.time}" data-bind="nc.time"/></label>
      </div>
      <fieldset class="field"><legend class="field-label">Where</legend><div class="seg">${['In person', 'Online', 'Hybrid'].map((f) => html`<button type="button" class="${cx('seg-btn', o.format === f && 'on')}" aria-pressed="${o.format === f}" data-action="ncSet" data-key="format" data-value="${f}">${f}</button>`)}</div></fieldset>
      ${o.format !== 'Online' ? html`<label class="field"><span class="field-label">Meeting place</span><input data-bind="nc.venue" value="${o.venue}" placeholder="A café, a park, your gym"/></label>` : ''}
      <p class="muted small">${icon('info', { size: 14 })}Not sure? Invite people first and Circles will suggest the time most of them can make.</p>`;
  } else if (o.step === 3) {
    body = html`<h2>Pick a first challenge</h2>
      <p class="muted">A shared challenge gives the first weeks a shape. You can change it any time.</p>
      <ul class="ch-lib">${g.challenges.map((x) => html`<li class="${cx(o.challenge === x.id && 'on')}"><span><strong>${x.title}</strong><small>${x.action} · ${x.days} days</small></span><button class="${cx('btn btn-sm', o.challenge === x.id ? 'btn-soft on' : 'btn-outline')}" data-action="ncSet" data-key="challenge" data-value="${x.id}">${o.challenge === x.id ? html`${icon('check', { size: 14 })}Chosen` : 'Choose'}</button></li>`)}</ul>`;
  } else {
    const src = o.sister && s.circles[o.sister];
    body = html`<h2>Invite your people</h2>
      ${src?.waitlist?.length ? html`<h3 class="h3">From ${src.name}’s waitlist</h3><ul class="roster">${src.waitlist.map((m) => html`<li>${avatar(m, 'md')}<span><strong>${person(m).name}</strong><small>${person(m).focus}</small></span><button class="${cx('btn btn-sm', o.invites.includes(m) ? 'btn-soft on' : 'btn-outline')}" data-action="ncInvite" data-id="${m}">${o.invites.includes(m) ? html`${icon('check', { size: 14 })}Invited` : 'Invite'}</button></li>`)}</ul>` : ''}
      <label class="field"><span class="field-label">Email addresses</span><textarea rows="3" data-bind="nc.emails" placeholder="One per line, or separated by commas"></textarea><span class="field-hint">Each person gets a personal invite from you, with the goal and the first meeting.</span></label>
      <div class="review">
        <h3 class="h3">Review</h3>
        <dl>
          <div><dt>Circle</dt><dd>${o.name || 'Untitled Circle'}</dd></div>
          <div><dt>Goal</dt><dd>${goalTag(o.goal)} ${o.sharedGoal}</dd></div>
          <div><dt>Meets</dt><dd>${dayName(o.dow)}s, ${fmtTime(o.time)} · ${o.format}${o.venue ? `, ${o.venue}` : ''}</dd></div>
          <div><dt>First challenge</dt><dd>${g.challenges.find((x) => x.id === o.challenge)?.title || 'None yet'}</dd></div>
          <div><dt>Seats</dt><dd>${seats(1 + o.invites.length, o.size)} you + ${o.invites.length + (o.emails.split(/[\s,]+/).filter((e) => e.includes('@')).length)} invited</dd></div>
        </dl>
      </div>`;
  }
  const canNext = o.step === 1 ? o.name && o.sharedGoal : o.step === 3 ? o.challenge : true;
  const main = html`
    <a class="back" href="#/lead">${icon('arrowLeft', { size: 16 })}Leader tools</a>
    <header class="page-head"><h1>${o.sister ? 'Start a sister Circle' : 'Start a new Circle'}</h1><p class="muted">Takes about two minutes. Your first month comes with an agenda, a challenge and a leader coach.</p></header>
    <div class="wizard card" style="--g:${g.hue};--g-soft:${g.soft};--g-deep:${g.deep}">
      <ol class="wizard-steps">${STEPS.map((st, i) => html`<li class="${cx(i < o.step && 'done', i === o.step && 'now')}"><span>${i < o.step ? icon('check', { size: 13 }) : i + 1}</span>${st}</li>`)}</ol>
      <div class="wizard-body">${body}</div>
      <div class="wizard-foot">
        ${o.step > 0 ? html`<button class="btn btn-ghost" data-action="ncBack">${icon('arrowLeft', { size: 16 })}Back</button>` : html`<span></span>`}
        ${o.step < STEPS.length - 1 ? html`<button class="btn btn-primary" data-action="ncNext" ${canNext ? '' : 'disabled'}>Continue ${icon('arrowRight', { size: 16 })}</button>` : html`<button class="btn btn-primary" data-action="ncCreate">${icon('send', { size: 16 })}Create and send invites</button>`}
      </div>
    </div>`;
  return { main };
}

export const newCircleActions = {
  ncSet(el) {
    set(() => {
      const o = nc(); const k = el.dataset.key; let v = el.dataset.value;
      if (k === 'size') v = Number(v);
      o[k] = v;
      if (k === 'goal') { o.challenge = null; }
    });
  },
  ncSelect(el) { set(() => { const o = nc(); o[el.dataset.key] = Number(el.value); }); },
  ncNext() { set(() => { const o = nc(); o.step = Math.min(o.step + 1, STEPS.length - 1); }); },
  ncBack() { set(() => { const o = nc(); o.step = Math.max(0, o.step - 1); }); },
  ncInvite(el) { set(() => { const o = nc(); const m = el.dataset.id; o.invites = o.invites.includes(m) ? o.invites.filter((x) => x !== m) : [...o.invites, m]; }); },
  ncCreate() {
    const o = nc();
    const g = GOALS[o.goal];
    const id = uid('c');
    const ch = g.challenges.find((x) => x.id === o.challenge) || g.challenges[0];
    const emails = o.emails.split(/[\s,]+/).filter((e) => e.includes('@'));
    set((s) => {
      s.circles[id] = {
        id, name: o.name || `${g.short} Circle`, goal: o.goal, leaderId: meId(), memberIds: [meId()], size: o.size, visibility: 'invite',
        place: o.format === 'Online' ? 'Online' : 'Vancouver', format: o.format, sharedGoal: o.sharedGoal, about: '',
        rhythm: { dow: o.dow, time: o.time, mins: 60, format: o.format, venue: o.venue, link: 'meet.circles.app/' + id },
        agenda: s.circles.c_sleep.agenda.map((a) => ({ ...a, id: uid('a') })), agreements: s.circles.c_sleep.agreements,
        challenge: { ...ch, startedDaysAgo: 0 }, rsvp: { [meId()]: 'yes' }, pastMeetings: [], waitlist: [],
        invites: [...o.invites.map((m) => ({ id: uid('inv'), uid: m, sentH: 0 })), ...emails.map((e) => ({ id: uid('inv'), email: e, sentH: 0 }))],
        startedWeeksAgo: 0, time: 'Evenings', level: 'Any',
      };
      s.challengeLog[id] = { [meId()]: [] };
      if (o.sister) { const src = s.circles[o.sister]; src.waitlist = src.waitlist.filter((m) => !o.invites.includes(m)); }
      s.leading[meId()] = [...(s.leading[meId()] || []), id];
      s.ui.leadCircle = id;
      s.posts.unshift({ id: uid('p'), circleId: id, uid: meId(), type: 'announcement', pinned: true, at: Date.now(), text: `Welcome to ${o.name}! We meet ${dayName(o.dow)}s at ${fmtTime(o.time)}. First up: the ${ch.title}. So glad you’re here.`, cheers: [], metoo: [], replies: [] });
      delete s.nc;
    }, { render: false });
    toast(`Circle created. ${o.invites.length + emails.length} invite${o.invites.length + emails.length === 1 ? '' : 's'} sent.`);
    go('/lead/members');
  },
};
