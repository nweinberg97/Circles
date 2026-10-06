import { html, cx, data } from '../lib/html.js';
import { icon } from '../ui/icons.js';
import { avatar, goalTag, plusTag, expertAvatar, circleRing, dots } from '../ui/components.js';
import { S, set, toast, meId, me, myCircle, myGoal, person, weekHits, challengeDay, challengeTodayDone, nextMeeting, daysUntil, postsFor, habitsDoneToday, isPlus, uid, TARGET_PER_WEEK, recentDays, hitFor, isLeaderOf, openModal } from '../store.js';
import { GOALS } from '../data/goals.js';
import { GUIDES, WORKSHOPS, EXPERTS, byGoal } from '../data/support.js';
import { greeting, key, fmtDate, fmtTime, relDay, ago, nextWeekday, daysAgo } from '../lib/dates.js';
import { leadTodos } from './lead.js';

export function meetingCard(c, { compact = false } = {}) {
  const s = S();
  const d = nextMeeting(c);
  const mine = c.rsvp[meId()];
  const going = c.memberIds.filter((m) => c.rsvp[m] === 'yes');
  const n = daysUntil(d);
  return html`<section class="${cx('card meet-card', compact && 'is-compact')}" aria-labelledby="meet-h">
    <div class="meet-date"><span>${d.toLocaleDateString('en-CA', { month: 'short' })}</span><strong>${d.getDate()}</strong></div>
    <div class="meet-body">
      <p class="meet-when">${relDay(d)}${n > 1 ? ` · in ${n} days` : ''}</p>
      <h3 id="meet-h"><a href="#/circle/meeting">Weekly Circle, ${fmtTime(c.rhythm.time)}</a></h3>
      <p class="meet-where">${c.rhythm.venue ? html`${icon('pin', { size: 14 })}${c.rhythm.venue}` : ''}${c.rhythm.link ? html`${icon('video', { size: 14 })}${c.rhythm.venue ? 'or video' : 'Video call'}` : ''}</p>
      <div class="meet-rsvp">
        ${['yes', 'maybe', 'no'].map((v) => html`<button type="button" class="${cx('rsvp', mine === v && 'on', `rsvp-${v}`)}" aria-pressed="${mine === v}" data-action="rsvp" data-value="${v}" data-circle="${c.id}">${{ yes: 'Going', maybe: 'Maybe', no: 'Can’t go' }[v]}</button>`)}
      </div>
      <p class="meet-going">${going.length} going${going.length ? html` · ${going.map((g) => person(g).first).slice(0, 4).join(', ')}${going.length > 4 ? '…' : ''}` : ''}</p>
    </div>
  </section>`;
}

export function checkinCard(c, g) {
  const s = S();
  const id = meId();
  const today = s.checkins[id]?.[key()];
  const opt = g.checkin.options.find((o) => o.v === today);
  const hits = weekHits(id, g.id);
  const days = recentDays(id, 7).map((x) => (x.v ? hitFor(g.id, x.v) : null));
  return html`<section class="card checkin" aria-labelledby="ci-h" style="--g:${g.hue};--g-soft:${g.soft};--g-deep:${g.deep}">
    <div class="checkin-head">
      <span class="checkin-icon">${icon(g.icon, { size: 20 })}</span>
      <div><h2 id="ci-h">${today ? 'Checked in' : g.checkin.question}</h2>
      <p>${hits} of ${TARGET_PER_WEEK} ${g.checkin.hitLabel} in the past 7 days · ${dots(days)}</p></div>
    </div>
    <div class="checkin-opts" role="radiogroup" aria-label="${g.checkin.question}">
      ${g.checkin.options.map((o) => html`<button type="button" role="radio" aria-checked="${today === o.v}" class="${cx('ci-opt', today === o.v && 'on', o.hit && 'is-hit')}" data-action="checkin" data-value="${o.v}">${o.label}</button>`)}
    </div>
    ${today && !s.ui.sharedCheckin?.[key()] ? html`<div class="checkin-share">
      <span>${opt?.hit ? 'Nice. That counts toward the Circle’s week.' : 'Logged. Rough nights count too; they tell your Circle how to help.'}</span>
      <button class="btn btn-sm btn-soft" data-action="shareCheckin">${icon('send', { size: 14 })}Tell your Circle</button>
    </div>` : ''}
  </section>`;
}

export function habitsCard(c) {
  const s = S();
  const id = meId();
  const habits = s.habits[id] || [];
  const done = habitsDoneToday(id);
  const n = habits.filter((h) => done[h.id]).length;
  return html`<section class="card habits" aria-labelledby="hab-h">
    <div class="card-head"><h2 id="hab-h">Today’s habits</h2><span class="muted">${n} of ${habits.length}</span></div>
    <ul class="habit-list">
      ${habits.map((h) => html`<li><button type="button" class="${cx('habit', done[h.id] && 'done')}" aria-pressed="${!!done[h.id]}" data-action="toggleHabit" data-id="${h.id}">
        <span class="check-box">${done[h.id] ? icon('check', { size: 14 }) : ''}</span>
        <span class="habit-text"><strong>${h.title}</strong><small>${h.detail}</small></span>
        ${h.challenge && c ? html`<span class="tag tag-challenge">${icon('flame', { size: 12 })}Day ${challengeDay(c)}</span>` : ''}
      </button></li>`)}
    </ul>
    ${habits.length === 0 ? html`<p class="muted">No habits yet. <a href="#/goal">Add one</a> to start.</p>` : ''}
    ${n === habits.length && habits.length ? html`<p class="habits-done">${icon('sparkles', { size: 15 })}All done for today. Go to bed proud.</p>` : ''}
  </section>`;
}

function notesCard() {
  const s = S();
  const notes = s.notes.filter((n) => n.to === meId()).slice(0, 2);
  if (!notes.length) return '';
  return html`<section class="notes" aria-label="Notes from your Circle">
    ${notes.map((n) => html`<div class="note">${avatar(n.from, 'sm')}<p><strong>${person(n.from).first}</strong> sent you a note · ${ago(n.at)}<span>“${n.text}”</span></p></div>`)}
  </section>`;
}

function circlePulse(c) {
  const posts = postsFor(c.id).filter((p) => !p.pinned).slice(0, 3);
  return html`<section class="card pulse" aria-labelledby="pulse-h">
    <div class="card-head"><h2 id="pulse-h">In your Circle</h2><a href="#/circle" class="link">Open ${icon('right', { size: 14 })}</a></div>
    <ul class="pulse-list">
      ${posts.map((p) => {
        const cheered = p.cheers.includes(meId());
        return html`<li>${avatar(p.uid, 'sm')}<div><p><strong>${p.uid === meId() ? 'You' : person(p.uid).first}</strong> ${p.text}</p>
        <span class="pulse-meta">${ago(p.at)}${p.uid !== meId() ? html` · <button class="${cx('mini-cheer', cheered && 'on')}" data-action="cheer" data-id="${p.id}" aria-pressed="${cheered}">${icon('heart', { size: 13 })}${cheered ? 'Cheered' : 'Cheer'}</button>` : ''}</span></div></li>`;
      })}
    </ul>
  </section>`;
}

function recommendCard(g) {
  const plus = isPlus();
  const w = byGoal(WORKSHOPS, g.id)[0];
  const guide = byGoal(GUIDES, g.id).find((x) => !x.plus) || byGoal(GUIDES, g.id)[0];
  if (!w && !guide) return '';
  const e = w ? EXPERTS[w.expert] : null;
  return html`<section class="card rec" aria-labelledby="rec-h">
    <div class="card-head"><h2 id="rec-h">For where you are this week</h2></div>
    ${guide ? html`<a class="rec-item" href="#/support/guide/${guide.id}"><span class="rec-kind">${icon('book', { size: 16 })}</span><span><strong>${guide.title}</strong><small>${guide.kind} · ${guide.mins} min · ${guide.summary}</small></span>${guide.plus && !plus ? plusTag() : ''}</a>` : ''}
    ${w ? html`<a class="rec-item" href="#/support"><span class="rec-kind">${expertAvatar(w.expert, 'sm')}</span><span><strong>${w.title}</strong><small>${e.name} · ${relDay(nextWeekday(w.dow, w.time))} ${fmtTime(w.time)} · live</small></span>${!plus ? plusTag() : ''}</a>` : ''}
  </section>`;
}

function leaderTodosCard(c) {
  const todos = leadTodos(c).slice(0, 3);
  if (!todos.length) return '';
  return html`<section class="card lead-todos" aria-labelledby="lt-h">
    <div class="card-head"><h2 id="lt-h">${icon('megaphone', { size: 18 })}Leading ${c.name.split(' — ')[0]}</h2><a class="link" href="#/lead">All leader tools ${icon('right', { size: 14 })}</a></div>
    <ul class="todo-list">${todos.map((t) => html`<li><span class="todo-icon">${icon(t.icon, { size: 16 })}</span><span><strong>${t.title}</strong><small>${t.body}</small></span><button class="btn btn-sm btn-soft" data-action="${t.action}" ${t.data ? data(t.data) : ''}>${t.cta}</button></li>`)}</ul>
  </section>`;
}

export function today() {
  const s = S();
  const c = myCircle();
  const p = me();
  const mg = myGoal();
  const g = GOALS[mg?.goal || c?.goal || 'sleep'];
  if (!c) return { main: html`<h1>${greeting()}, ${p.first}</h1><p>You’re not in a Circle yet. <a href="#/discover">Find one</a>.</p>` };
  const d = nextMeeting(c);
  const lead = s.persona === 'leader' && isLeaderOf(c);
  const main = html`
    <header class="page-head today-head">
      <p class="muted">${fmtDate(new Date())}</p>
      <h1>${greeting()}, ${p.first}.</h1>
      <p class="today-sub">Day ${challengeDay(c)} of the ${c.challenge.title.replace(/^\d+-Day /, '')}. ${daysUntil(d) === 0 ? 'Circle meets today.' : `Circle meets ${relDay(d).toLowerCase() === 'tomorrow' ? 'tomorrow' : `in ${daysUntil(d)} days`}.`}</p>
    </header>
    ${lead ? leaderTodosCard(c) : ''}
    ${notesCard()}
    ${checkinCard(c, g)}
    ${habitsCard(c)}
    ${circlePulse(c)}
    ${recommendCard(g)}`;
  const rail = html`
    ${meetingCard(c, { compact: true })}
    <section class="card rail-ring"><div class="card-head"><h2>${c.name.split(' — ')[0]}</h2><a class="link" href="#/circle">Open</a></div>${circleRing(c, { size: 'sm' })}</section>`;
  return { main, rail };
}

export const todayActions = {
  checkin(el) {
    const v = el.dataset.value;
    set((s) => {
      const id = meId();
      s.checkins[id] = s.checkins[id] || {};
      s.checkins[id][key()] = v;
      s.people[id].lastActive = Date.now();
    });
  },
  shareCheckin() {
    const c = myCircle();
    const g = GOALS[c.goal];
    set((s) => {
      const v = s.checkins[meId()][key()];
      const o = g.checkin.options.find((x) => x.v === v);
      const text = c.goal === 'sleep' ? (o.hit ? `Slept ${o.label.replace('h', ' hours').replace('+', ' or more')} last night.` : `Only ${o.label.toLowerCase().replace('h', ' hours')} last night. Trying again tonight.`) : `${o.label}.`;
      s.posts.unshift({ id: uid('p'), circleId: c.id, uid: meId(), type: o.hit ? 'checkin' : 'struggle', at: Date.now(), text, cheers: [], metoo: [], replies: [] });
      s.ui.sharedCheckin = { [key()]: true };
    });
    toast('Shared with your Circle');
  },
  toggleHabit(el) {
    const hid = el.dataset.id;
    let completedChallenge = false;
    set((s) => {
      const id = meId();
      s.habitLog[id] = s.habitLog[id] || {};
      const t = (s.habitLog[id][key()] = s.habitLog[id][key()] || {});
      t[hid] = !t[hid];
      const h = s.habits[id].find((x) => x.id === hid);
      const c = myCircle();
      if (h?.challenge && c) {
        const log = (s.challengeLog[c.id][id] = s.challengeLog[c.id][id] || []);
        log[challengeDay(c) - 1] = !!t[hid];
        completedChallenge = !!t[hid];
      }
      s.people[id].lastActive = Date.now();
    });
    if (completedChallenge) toast('Challenge day logged. Your Circle can see it.');
  },
  rsvp(el) {
    const v = el.dataset.value;
    set((s) => { s.circles[el.dataset.circle].rsvp[meId()] = v; });
    toast(v === 'yes' ? 'See you there' : v === 'maybe' ? 'Marked as maybe' : 'Thanks for letting everyone know');
  },
  cheer(el) {
    set((s) => {
      const p = s.posts.find((x) => x.id === el.dataset.id);
      const i = p.cheers.indexOf(meId());
      if (i >= 0) p.cheers.splice(i, 1); else p.cheers.push(meId());
    });
  },
};

void daysAgo; void plusTag; void goalTag; void openModal;
