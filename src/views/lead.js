import { html, cx } from '../lib/html.js';
import { icon } from '../ui/icons.js';
import { avatar, dots, progressBar, goalTag, seats, emptyState, segmented } from '../ui/components.js';
import { S, set, toast, meId, person, circle as getCircle, weekHits, weekLogged, challengeDay, challengeDone, challengeCount, nextMeeting, daysUntil, lastActiveDays, recentDays, hitFor, uid, openModal, circleWeek, TARGET_PER_WEEK, postsFor } from '../store.js';
import { GOALS } from '../data/goals.js';
import { dayName, fmtTime, shortDay, relDay, ago, weekDays, addDays, key } from '../lib/dates.js';
import { go } from '../lib/router.js';

export function leadCircle() {
  const s = S();
  const ids = s.leading[meId()] || [];
  const cur = s.ui.leadCircle && ids.includes(s.ui.leadCircle) ? s.ui.leadCircle : ids[0];
  return cur ? getCircle(cur) : null;
}

export function leadTodos(c) {
  if (!c) return [];
  const todos = [];
  const quiet = c.memberIds.filter((m) => m !== c.leaderId && lastActiveDays(m) >= 5);
  quiet.forEach((m) => {
    const p = person(m);
    if (S().ui.nudged?.[m]) return;
    todos.push({ icon: 'heart', title: `${p.first} has been quiet for ${lastActiveDays(m)} days`, body: 'A short, warm note works better than a reminder.', cta: `Write to ${p.first}`, action: 'nudgeMember', data: { id: m } });
  });
  const noReply = c.memberIds.filter((m) => !c.rsvp[m]);
  if (noReply.length && !S().ui.rsvpNudged) todos.push({ icon: 'calendar', title: `${noReply.length} haven’t replied for ${dayName(c.rhythm.dow)}`, body: noReply.map((m) => person(m).first).join(', '), cta: 'Send a reminder', action: 'leadRemind' });
  const left = c.challenge.days - challengeDay(c);
  if (left <= 4) todos.push({ icon: 'flame', title: `${c.challenge.title} ends in ${left} day${left === 1 ? '' : 's'}`, body: 'Line up the next one so there’s no gap after Sunday.', cta: 'Pick next', action: 'navLead', data: { to: '/lead/challenge' } });
  if (c.waitlist?.length) todos.push({ icon: 'userPlus', title: `${c.waitlist.length} people are waiting to join`, body: 'Your Circle is full. A sister Circle keeps both groups small.', cta: 'See waitlist', action: 'navLead', data: { to: '/lead/members' } });
  return todos;
}

const TABS = [
  { id: '', label: 'Overview' },
  { id: 'members', label: 'Members' },
  { id: 'rhythm', label: 'Rhythm & agenda' },
  { id: 'challenge', label: 'Challenges' },
  { id: 'settings', label: 'Settings' },
  { id: 'support', label: 'Leader support' },
];

function head(c, tab) {
  const s = S();
  const ids = s.leading[meId()] || [];
  const g = GOALS[c.goal];
  return html`<header class="page-head lead-head" style="--g:${g.hue};--g-soft:${g.soft};--g-deep:${g.deep}">
    <div class="lead-title">
      <p class="muted">You lead</p>
      ${ids.length > 1 ? html`<select class="lead-switch" data-change="switchLeadCircle" aria-label="Circle">${ids.map((id) => html`<option value="${id}" ${id === c.id ? 'selected' : ''}>${getCircle(id).name}</option>`)}</select>` : html`<h1>${c.name}</h1>`}
      ${ids.length > 1 ? html`<h1 class="sr-only">${c.name}</h1>` : ''}
    </div>
    <div class="lead-head-actions"><a class="btn btn-sm btn-outline" href="#/circle">${icon('circle', { size: 15 })}View as member</a><a class="btn btn-sm btn-primary" href="#/new-circle">${icon('plus', { size: 15 })}New Circle</a></div>
  </header>
  <nav class="tabs" aria-label="Leader tools">${TABS.map((t) => html`<a class="${cx('tab-link', (tab || '') === t.id && 'on')}" href="#/lead${t.id ? '/' + t.id : ''}" ${(tab || '') === t.id ? 'aria-current="page"' : ''}>${t.label}</a>`)}</nav>`;
}

function memberStatus(c, m) {
  const d = lastActiveDays(m);
  const wk = weekHits(m, c.goal);
  if (d >= 5) return html`<span class="status st-quiet">Quiet ${d} days</span>`;
  if (wk >= 4) return html`<span class="status st-good">On a roll</span>`;
  if (weekLogged(m) <= 1) return html`<span class="status st-watch">Few check-ins</span>`;
  return html`<span class="status st-ok">Steady</span>`;
}

function overview(c) {
  const g = GOALS[c.goal];
  const day = challengeDay(c);
  const checkedIn = c.memberIds.filter((m) => weekLogged(m) >= Math.min(3, (new Date().getDay() + 6) % 7 + 1)).length;
  const lastNight = c.memberIds.filter((m) => challengeDone(c, m, day - 2)).length;
  const rsvps = c.memberIds.filter((m) => c.rsvp[m] === 'yes').length;
  const postsWeek = postsFor(c.id).filter((p) => Date.now() - p.at < 7 * 86400000).length;
  const todos = leadTodos(c);
  const cw = circleWeek(c);
  const weeks = [3, 2, 1, 0].map((w) => { const days = Array.from({ length: 7 }, (_, i) => addDays(new Date(), -(7 * w + i))); return { w, hits: c.memberIds.reduce((n, m) => n + days.filter((d) => hitFor(c.goal, S().checkins[m]?.[key(d)])).length, 0) }; });
  return html`
    <section class="pulse-stats" aria-label="This week">
      <div><strong>${checkedIn}<small>/${c.memberIds.length}</small></strong><span>checking in regularly</span></div>
      <div><strong>${lastNight}<small>/${c.memberIds.length}</small></strong><span>did the challenge last night</span></div>
      <div><strong>${rsvps}<small>/${c.memberIds.length}</small></strong><span>coming ${(() => { const r = relDay(nextMeeting(c)); return /^(Today|Tomorrow)$/.test(r) ? r.toLowerCase() : r; })()}</span></div>
      <div><strong>${postsWeek}</strong><span>posts and check-ins this week</span></div>
    </section>

    <section class="card" aria-labelledby="att-h">
      <div class="card-head"><h2 id="att-h">Needs you</h2><span class="muted">${todos.length ? `${todos.length} things` : 'All clear'}</span></div>
      ${todos.length ? html`<ul class="todo-list">${todos.map((t) => html`<li><span class="todo-icon">${icon(t.icon, { size: 16 })}</span><span><strong>${t.title}</strong><small>${t.body}</small></span><button class="btn btn-sm btn-soft" data-action="${t.action}" ${t.data ? Object.entries(t.data).map(([k, v]) => html`data-${k}="${v}" `) : ''}>${t.cta}</button></li>`)}</ul>` : html`<p class="muted">Nothing needs you right now. Enjoy it.</p>`}
    </section>

    <section class="card" aria-labelledby="mt-h">
      <div class="card-head"><h2 id="mt-h">How everyone’s doing</h2><span class="muted">Last 7 days</span></div>
      <div class="mtable" role="table" aria-label="Members this week">
        <div class="mrow mhead" role="row"><span role="columnheader">Member</span><span role="columnheader">Check-ins</span><span role="columnheader">Challenge</span><span role="columnheader">Last seen</span><span role="columnheader">Status</span></div>
        ${c.memberIds.map((m) => { const p = person(m); const rd = recentDays(m, 7).map((x) => (x.v ? hitFor(c.goal, x.v) : null)); return html`<div class="mrow" role="row">
          <span role="cell" class="mcell-name"><button class="mname" data-action="openMember" data-id="${m}">${avatar(p, 'sm')}<span><strong>${m === meId() ? 'You' : p.name}</strong><small>${p.focus}</small></span></button></span>
          <span role="cell">${dots(rd)}</span>
          <span role="cell">${challengeCount(c, m)}/${day}</span>
          <span role="cell" class="muted">${m === meId() ? 'now' : ago(p.lastActive)}</span>
          <span role="cell">${memberStatus(c, m)}</span>
        </div>`; })}
      </div>
      <p class="muted small">Members see their own detail and the Circle total. You see this view because you lead.</p>
    </section>

    <div class="lead-two">
      <form class="card" data-submit="announce" aria-labelledby="an-h">
        <div class="card-head"><h2 id="an-h">${icon('megaphone', { size: 18 })}Post an announcement</h2></div>
        <textarea name="text" rows="3" placeholder="Pinned to the top of the Circle…" aria-label="Announcement"></textarea>
        <div class="row-end"><button class="btn btn-sm btn-primary" type="submit">Pin to Circle</button></div>
      </form>
      <section class="card" aria-labelledby="tr-h">
        <div class="card-head"><h2 id="tr-h">Circle progress</h2><span class="muted">${g.checkin.hitLabel}</span></div>
        <div class="wbars wbars-sm">${weeks.map((w) => html`<div class="wbar"><span class="wbar-col"><i style="height:${(w.hits / (c.memberIds.length * 7)) * 100}%" class="${w.hits >= c.memberIds.length * TARGET_PER_WEEK ? 'met' : ''}"></i></span><strong>${w.hits}</strong><small>${w.w === 0 ? 'This wk' : `${w.w}w ago`}</small></div>`)}</div>
        <p class="muted small">Target ${cw.target} a week (${TARGET_PER_WEEK} each).</p>
      </section>
    </div>`;
}

function membersTab(c) {
  const s = S();
  const reqs = s.requests.filter((r) => r.circleId === c.id);
  return html`
    <section class="card" aria-labelledby="ro-h">
      <div class="card-head"><h2 id="ro-h">Members</h2>${seats(c.memberIds.length, c.size)}</div>
      <ul class="roster">${c.memberIds.map((m) => { const p = person(m); return html`<li>${avatar(p, 'md', { action: 'openMember', label: p.name })}<span><strong>${p.name}${m === c.leaderId ? html` <span class="tag">Leader</span>` : ''}</strong><small>${p.focus} · ${p.hood}</small></span>${m !== c.leaderId ? html`<button class="btn btn-sm btn-outline" data-action="nudgeMember" data-id="${m}">${icon('heart', { size: 14 })}Note</button>` : ''}</li>`; })}</ul>
    </section>
    <section class="card" aria-labelledby="inv-h">
      <div class="card-head"><h2 id="inv-h">Invite</h2></div>
      ${c.memberIds.length >= c.size ? html`<p class="notice">${icon('info', { size: 16 })}Your Circle is full at ${c.size}. Circles work best small; invite people to a sister Circle instead.</p>` : ''}
      <form class="invite-form" data-submit="sendInvite"><input name="email" type="email" placeholder="friend@email.com" aria-label="Email address" required/><button class="btn btn-primary btn-sm" type="submit">Send invite</button></form>
      <div class="link-copy"><span>${icon('link', { size: 15 })}circles.app/i/${c.id.replace('c_', '')}-${meId().slice(2)}</span><button class="btn btn-sm btn-outline" data-action="copyInvite">Copy link</button></div>
      ${(c.invites || []).length ? html`<h3 class="h3">Pending</h3><ul class="pending">${c.invites.map((i) => html`<li>${icon('mail', { size: 15 })}<span>${i.uid ? person(i.uid).name : i.email}</span><span class="muted">sent ${ago(Date.now() - (i.sentH || 0) * 3600000)}</span><button class="btn btn-sm btn-link" data-action="resendInvite" data-id="${i.id}">Resend</button></li>`)}</ul>` : ''}
    </section>
    <section class="card" aria-labelledby="wl-h">
      <div class="card-head"><h2 id="wl-h">Waitlist & requests</h2></div>
      ${(c.waitlist || []).length + reqs.length ? html`<ul class="roster">
        ${reqs.map((r) => html`<li>${avatar(r.uid, 'md')}<span><strong>${person(r.uid).name}</strong><small>“${r.note || 'Would love to join.'}”</small></span><button class="btn btn-sm btn-primary" data-action="approveRequest" data-id="${r.id}">Approve</button></li>`)}
        ${c.waitlist.map((m) => html`<li>${avatar(m, 'md')}<span><strong>${person(m).name}</strong><small>${person(m).focus} · ${person(m).hood}</small></span><span class="tag tag-faint">Waiting</span></li>`)}
      </ul>
      <div class="sister">${icon('sparkles', { size: 18 })}<div><strong>Start a sister Circle</strong><p>Same goal and rhythm, a new group. You can co-lead it or hand it to someone ready to step up.</p></div><a class="btn btn-sm btn-primary" href="#/new-circle?sister=${c.id}">Start it</a></div>` : html`<p class="muted">No one waiting right now.</p>`}
    </section>`;
}

function rhythmTab(c) {
  const r = c.rhythm;
  const slots = ['7 AM', '9 AM', '10 AM', '12 PM', '6 PM', '8 PM'];
  const grid = c.availability?.grid;
  const days = [1, 2, 3, 4, 5, 6, 0];
  const total = c.agenda.reduce((n, a) => n + a.mins, 0);
  return html`
    <form class="card" data-submit="saveRhythm" aria-labelledby="rh-h">
      <div class="card-head"><h2 id="rh-h">Meeting rhythm</h2></div>
      <div class="form-grid">
        <label class="field"><span class="field-label">Day</span><select name="dow">${[0, 1, 2, 3, 4, 5, 6].map((d) => html`<option value="${d}" ${r.dow === d ? 'selected' : ''}>${dayName(d)}</option>`)}</select></label>
        <label class="field"><span class="field-label">Time</span><input type="time" name="time" value="${r.time}"/></label>
        <label class="field"><span class="field-label">How often</span><select name="freq"><option>Weekly</option><option>Every two weeks</option></select></label>
        <label class="field"><span class="field-label">Length</span><select name="mins">${[30, 45, 60, 90].map((m) => html`<option value="${m}" ${r.mins === m ? 'selected' : ''}>${m} minutes</option>`)}</select></label>
        <label class="field"><span class="field-label">Format</span><select name="format">${['In person', 'Online', 'Hybrid'].map((f) => html`<option ${r.format === f ? 'selected' : ''}>${f}</option>`)}</select></label>
        <label class="field"><span class="field-label">Place</span><input name="venue" value="${r.venue || ''}" placeholder="Café, park, gym…"/></label>
        <label class="field span-2"><span class="field-label">Address</span><input name="address" value="${r.address || ''}"/></label>
        <label class="field span-2"><span class="field-label">Video link</span><input name="link" value="${r.link || ''}"/></label>
      </div>
      <div class="row-end"><button class="btn btn-primary btn-sm" type="submit">Save rhythm</button></div>
    </form>

    ${grid ? html`<section class="card" aria-labelledby="av-h">
      <div class="card-head"><h2 id="av-h">When your Circle is free</h2><span class="muted">From everyone’s availability</span></div>
      <div class="avail" role="table" aria-label="Availability">
        <div class="avail-row avail-head" role="row"><span></span>${days.map((d) => html`<span role="columnheader">${shortDay(d)}</span>`)}</div>
        ${slots.map((sl, si) => html`<div class="avail-row" role="row"><span role="rowheader">${sl}</span>${days.map((d) => { const n = grid[d][si]; const cur = r.dow === d && ['07:00', '09:00', '10:00', '12:00', '18:00', '20:00'][si] === r.time; return html`<button type="button" role="cell" class="${cx('avail-cell', cur && 'is-current')}" style="--a:${n / c.memberIds.length}" data-action="pickSlot" data-dow="${d}" data-time="${['07:00', '09:00', '10:00', '12:00', '18:00', '20:00'][si]}" aria-label="${dayName(d)} ${sl}: ${n} of ${c.memberIds.length} free">${n}</button>`; })}</div>`)}
      </div>
      <p class="muted small">Tap a time to move the meeting there. Darker means more people are free.</p>
    </section>` : ''}

    <section class="card" aria-labelledby="agd-h">
      <div class="card-head"><h2 id="agd-h">Agenda</h2><span class="muted">${total} of ${r.mins} minutes</span></div>
      <div class="templates"><span class="muted">Start from:</span>${[{ v: 'standard', l: 'Weekly check-in' }, { v: 'learn', l: 'Learn together' }, { v: 'walk', l: 'Walk & talk' }].map((t) => html`<button class="chip" data-action="agendaTemplate" data-value="${t.v}">${t.l}</button>`)}</div>
      <ol class="agenda-edit">${c.agenda.map((a, i) => html`<li>
        <span class="agenda-n">${i + 1}</span>
        <input value="${a.title}" data-change="agendaTitle" data-id="${a.id}" aria-label="Agenda item ${i + 1}"/>
        <select data-change="agendaMins" data-id="${a.id}" aria-label="Minutes">${[5, 10, 15, 20, 30].map((m) => html`<option value="${m}" ${a.mins === m ? 'selected' : ''}>${m} min</option>`)}</select>
        <span class="agenda-move"><button class="icon-btn" data-action="agendaMove" data-id="${a.id}" data-dir="-1" aria-label="Move up" ${i === 0 ? 'disabled' : ''}>${icon('up', { size: 16 })}</button><button class="icon-btn" data-action="agendaMove" data-id="${a.id}" data-dir="1" aria-label="Move down" ${i === c.agenda.length - 1 ? 'disabled' : ''}>${icon('down', { size: 16 })}</button><button class="icon-btn" data-action="agendaRemove" data-id="${a.id}" aria-label="Remove">${icon('x', { size: 16 })}</button></span>
      </li>`)}</ol>
      <div class="row-between"><button class="btn btn-sm btn-soft" data-action="agendaAdd">${icon('plus', { size: 14 })}Add item</button><button class="btn btn-sm btn-primary" data-action="startMeeting">${icon('play', { size: 14 })}Run this meeting</button></div>
    </section>`;
}

function challengeTab(c) {
  const g = GOALS[c.goal];
  const day = challengeDay(c);
  const next = S().ui.nextChallenge?.[c.id];
  return html`
    <section class="card" aria-labelledby="cc-h">
      <div class="card-head"><h2 id="cc-h">${c.challenge.title}</h2><span class="muted">Day ${day} of ${c.challenge.days}</span></div>
      <p>${c.challenge.action}</p>
      <div class="ch-grid" role="table" aria-label="Challenge progress">
        ${c.memberIds.map((m) => html`<div class="ch-row" role="row"><span class="ch-who">${avatar(m, 'xs')}${m === meId() ? 'You' : person(m).first}</span><span class="ch-days">${Array.from({ length: c.challenge.days }, (_, i) => html`<i class="${cx(i < day && (challengeDone(c, m, i) ? 'hit' : i < day - 1 ? 'miss' : 'today'))}"></i>`)}</span><span class="muted">${challengeCount(c, m)}</span></div>`)}
      </div>
    </section>
    <section class="card" aria-labelledby="nx-h">
      <div class="card-head"><h2 id="nx-h">Up next</h2>${next ? html`<span class="tag tag-ok">Starts after ${dayName(c.rhythm.dow)}</span>` : ''}</div>
      <ul class="ch-lib">${g.challenges.filter((x) => x.id !== c.challenge.id).map((x) => html`<li class="${cx(next === x.id && 'on')}"><span><strong>${x.title}</strong><small>${x.action} · ${x.days} days</small></span><button class="${cx('btn btn-sm', next === x.id ? 'btn-soft on' : 'btn-outline')}" data-action="queueChallenge" data-id="${x.id}">${next === x.id ? html`${icon('check', { size: 14 })}Queued` : 'Queue it'}</button></li>`)}</ul>
      <form class="custom-ch" data-submit="customChallenge">
        <h3 class="h3">Or make your own</h3>
        <div class="form-grid"><label class="field span-2"><span class="field-label">Name</span><input name="title" placeholder="e.g. Screens Off at 10"/></label>
        <label class="field span-2"><span class="field-label">Daily action</span><input name="action" placeholder="What does everyone do each day?"/></label>
        <label class="field"><span class="field-label">Length</span><select name="days"><option value="5">5 days</option><option value="7" selected>7 days</option><option value="14">14 days</option></select></label></div>
        <div class="row-end"><button class="btn btn-sm btn-primary" type="submit">Create and queue</button></div>
      </form>
    </section>`;
}

function settingsTab(c) {
  return html`<form class="card" data-submit="saveSettings" aria-labelledby="st-h">
    <div class="card-head"><h2 id="st-h">Circle settings</h2></div>
    <label class="field"><span class="field-label">Name</span><input name="name" value="${c.name}"/></label>
    <label class="field"><span class="field-label">Shared goal</span><input name="sharedGoal" value="${c.sharedGoal}"/><span class="field-hint">What everyone is working toward together. Keep it measurable.</span></label>
    <label class="field"><span class="field-label">About</span><textarea name="about" rows="3">${c.about || ''}</textarea></label>
    <fieldset class="field"><legend class="field-label">Who can find this Circle</legend>
      <label class="radio-row"><input type="radio" name="visibility" value="invite" ${c.visibility === 'invite' ? 'checked' : ''}/><span><strong>Invite only</strong><small>Only people you invite can join.</small></span></label>
      <label class="radio-row"><input type="radio" name="visibility" value="request" ${c.visibility === 'request' ? 'checked' : ''}/><span><strong>Listed in Discover</strong><small>People can ask to join; you approve each one.</small></span></label>
    </fieldset>
    <fieldset class="field"><legend class="field-label">Size</legend>${segmented('size', ['5', '6', '7'], String(c.size), 'setSize')}<span class="field-hint">Small enough that everyone is known.</span></fieldset>
    <label class="field"><span class="field-label">Outside group chat (optional)</span><input name="chat" value="${c.chat || ''}" placeholder="WhatsApp or iMessage invite link"/><span class="field-hint">Most Circles keep everything here, but some like a group chat too.</span></label>
    <div class="row-end"><button class="btn btn-primary btn-sm" type="submit">Save settings</button></div>
  </form>`;
}

function supportTab() {
  const s = S();
  const booked = s.support.leaderCall;
  return html`
    <section class="leader-support">
      <div class="card"><span class="ls-icon">${icon('book')}</span><h2>Leader playbook</h2><p>Short guides for the moments that matter: the first meeting, the quiet member, the week everyone falls off.</p>
        <ul class="plain-list"><li><a href="#/lead/support" data-action="playbook" data-value="first">Running a great first meeting</a></li><li><a href="#/lead/support" data-action="playbook" data-value="quiet">Reaching out to a quiet member</a></li><li><a href="#/lead/support" data-action="playbook" data-value="slump">When the whole Circle slumps</a></li><li><a href="#/lead/support" data-action="playbook" data-value="handoff">Handing off leadership</a></li></ul></div>
      <div class="card"><span class="ls-icon">${icon('phone')}</span><h2>15-minute leader coaching</h2><p>Talk through anything with a coach who has led dozens of Circles. Free for every leader.</p>
        ${booked ? html`<p class="asked">${icon('check', { size: 15 })}Booked: ${booked}</p>` : html`<div class="slots">${['Wed 12:00 PM', 'Thu 7:30 PM', 'Sat 9:00 AM'].map((sl) => html`<button class="slot" data-action="bookLeaderCall" data-value="${sl}">${sl}</button>`)}</div>`}</div>
      <div class="card"><span class="ls-icon">${icon('mail')}</span><h2>24/7 leader inbox</h2><p>A real person replies, usually within a couple of hours, day or night.</p><button class="btn btn-sm btn-outline" data-action="emailSupport">Email leader support</button></div>
    </section>`;
}

export function leadPage(tab) {
  const s = S();
  if (s.persona !== 'leader') {
    return { main: emptyState({ iconName: 'megaphone', title: 'Leader tools', body: 'Switch to Maya, the leader of Better Sleep — Vancouver, to see how leaders run a Circle.', action: html`<button class="btn btn-primary" data-action="persona" data-value="leader">View as Maya</button>` }) };
  }
  const c = leadCircle();
  if (!c) return { main: emptyState({ iconName: 'circle', title: 'You’re not leading a Circle yet', body: 'Start one in a couple of minutes.', action: html`<a class="btn btn-primary" href="#/new-circle">Start a Circle</a>` }) };
  const body = { '': overview, members: membersTab, rhythm: rhythmTab, challenge: challengeTab, settings: settingsTab, support: supportTab }[tab || ''] || overview;
  return { main: html`${head(c, tab)}${body(c)}` };
}

function standardAgenda(kind) {
  const T = {
    standard: [['Check in: one word for your week', 5], ['What went well?', 10], ['What was difficult?', 10], ['What are you working on this week?', 10], ['Group challenge', 5], ['Commitments', 10], ['Coffee and the fun part', 10]],
    learn: [['Check in', 5], ['Watch or read together', 15], ['Discuss: what would you try?', 15], ['Pick one experiment each', 10], ['Commitments', 10]],
    walk: [['Meet and start walking', 5], ['Pairs: how’s your week?', 15], ['Swap partners: what’s hard?', 15], ['Circle up: commitments', 10]],
  };
  return T[kind].map(([title, mins]) => ({ id: uid('a'), title, mins }));
}

export const leadActions = {
  switchLeadCircle(el) { set((s) => { s.ui.leadCircle = el.value; s.myCircle[meId()] = el.value; }); },
  navLead(el) { go(el.dataset.to); },
  nudgeMember(el) { openModal('note', { id: el.dataset.id, leader: true }); },
  leadRemind() { set((s) => { s.ui.rsvpNudged = true; }); toast('Reminder sent to everyone who hasn’t replied'); },
  announce(form, fd) {
    const text = (fd.get('text') || '').toString().trim();
    if (!text) { toast('Write your announcement first'); return; }
    const c = leadCircle();
    set((s) => { s.posts.forEach((p) => { if (p.circleId === c.id) p.pinned = false; }); s.posts.unshift({ id: uid('p'), circleId: c.id, uid: meId(), type: 'announcement', pinned: true, at: Date.now(), text, cheers: [], metoo: [], replies: [] }); });
    toast('Pinned to the top of your Circle');
  },
  sendInvite(form, fd) {
    const email = (fd.get('email') || '').toString().trim();
    const c = leadCircle();
    set((s) => { c.invites = c.invites || []; c.invites.push({ id: uid('inv'), email, sentH: 0 }); });
    toast(`Invite sent to ${email}`);
  },
  copyInvite() { try { navigator.clipboard?.writeText(`https://circles.app/i/${leadCircle().id}`); } catch { /* ignore */ } toast('Invite link copied'); },
  resendInvite() { toast('Invite resent'); },
  approveRequest(el) {
    const c = leadCircle();
    const r = S().requests.find((x) => x.id === el.dataset.id);
    if (c.memberIds.length >= c.size) { toast('Your Circle is full. Start a sister Circle for them.'); return; }
    set((s) => { c.memberIds.push(r.uid); s.requests = s.requests.filter((x) => x.id !== r.id); });
    toast(`${person(r.uid).first} is in`);
  },
  saveRhythm(form, fd) {
    const c = leadCircle();
    set(() => { Object.assign(c.rhythm, { dow: Number(fd.get('dow')), time: fd.get('time'), mins: Number(fd.get('mins')), format: fd.get('format'), venue: fd.get('venue'), address: fd.get('address'), link: fd.get('link') }); c.format = fd.get('format'); });
    toast(`Meetings are now ${dayName(c.rhythm.dow)}s at ${fmtTime(c.rhythm.time)}. Your Circle has been told.`);
  },
  pickSlot(el) {
    const c = leadCircle();
    set(() => { c.rhythm.dow = Number(el.dataset.dow); c.rhythm.time = el.dataset.time; });
    toast(`Moved to ${dayName(c.rhythm.dow)}s at ${fmtTime(c.rhythm.time)}`);
  },
  agendaTemplate(el) { const c = leadCircle(); set(() => { c.agenda = standardAgenda(el.dataset.value); }); toast('Agenda replaced'); },
  agendaTitle(el) { const c = leadCircle(); set(() => { c.agenda.find((a) => a.id === el.dataset.id).title = el.value; }, { render: false }); },
  agendaMins(el) { const c = leadCircle(); set(() => { c.agenda.find((a) => a.id === el.dataset.id).mins = Number(el.value); }); },
  agendaMove(el) {
    const c = leadCircle();
    set(() => { const i = c.agenda.findIndex((a) => a.id === el.dataset.id); const j = i + Number(el.dataset.dir); if (j < 0 || j >= c.agenda.length) return; [c.agenda[i], c.agenda[j]] = [c.agenda[j], c.agenda[i]]; });
  },
  agendaRemove(el) { const c = leadCircle(); set(() => { c.agenda = c.agenda.filter((a) => a.id !== el.dataset.id); }); },
  agendaAdd() { const c = leadCircle(); set(() => { c.agenda.push({ id: uid('a'), title: 'New item', mins: 5 }); }); setTimeout(() => { const ins = document.querySelectorAll('.agenda-edit input'); ins[ins.length - 1]?.select(); }, 0); },
  queueChallenge(el) { const c = leadCircle(); set((s) => { s.ui.nextChallenge = { ...(s.ui.nextChallenge || {}), [c.id]: el.dataset.id }; }); toast('Queued. It starts after Sunday’s meeting.'); },
  customChallenge(form, fd) {
    const title = (fd.get('title') || '').toString().trim();
    const action = (fd.get('action') || '').toString().trim();
    if (!title || !action) { toast('Add a name and a daily action'); return; }
    const c = leadCircle();
    const g = GOALS[c.goal];
    const id = uid('ch');
    g.challenges.push({ id, title, action, days: Number(fd.get('days')) });
    set((s) => { s.ui.nextChallenge = { ...(s.ui.nextChallenge || {}), [c.id]: id }; });
    toast(`“${title}” is queued`);
  },
  setSize(el) { const c = leadCircle(); if (Number(el.dataset.value) < c.memberIds.length) { toast(`You have ${c.memberIds.length} members already`); return; } set(() => { c.size = Number(el.dataset.value); }); },
  saveSettings(form, fd) {
    const c = leadCircle();
    set(() => { c.name = fd.get('name'); c.sharedGoal = fd.get('sharedGoal'); c.about = fd.get('about'); c.visibility = fd.get('visibility'); c.chat = fd.get('chat'); });
    toast('Settings saved');
  },
  bookLeaderCall(el) { set((s) => { s.support.leaderCall = `${el.dataset.value} with Jo, leader coach`; }); toast('Booked. Jo will call you.'); },
  playbook(el) { openModal('playbook', { id: el.dataset.value }); },
};

void progressBar; void goalTag; void daysUntil;
