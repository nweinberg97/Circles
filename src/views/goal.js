import { html, cx } from '../lib/html.js';
import { icon } from '../ui/icons.js';
import { goalTag, progressBar, avatar } from '../ui/components.js';
import { S, set, toast, meId, me, myCircle, myGoal, weekHits, streak, hitFor, habitRate, challengeDay, challengeCount, TARGET_PER_WEEK, openModal, uid, circleWeek } from '../store.js';
import { GOALS } from '../data/goals.js';
import { key, daysAgo, weekDays, fmtDate, addDays, startOfDay } from '../lib/dates.js';

function heatmap(uidv, goalId) {
  const log = S().checkins[uidv] || {};
  const start = weekDays(addDays(new Date(), -21))[0];
  const cells = Array.from({ length: 28 }, (_, i) => addDays(start, i));
  const today = startOfDay();
  return html`<div class="heat" role="img" aria-label="Last four weeks of check-ins">
    <div class="heat-dow">${['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d) => html`<span>${d}</span>`)}</div>
    <div class="heat-grid">${cells.map((d) => {
      const v = log[key(d)];
      const future = d > today;
      const cls = future ? 'future' : v ? (hitFor(goalId, v) ? 'hit' : 'miss') : 'none';
      return html`<span class="${cx('heat-cell', cls, +d === +today && 'is-today')}" title="${fmtDate(d)}${v ? '' : future ? '' : ' · no check-in'}"></span>`;
    })}</div>
    <div class="heat-legend"><span><i class="hit"></i>On target</span><span><i class="miss"></i>Checked in</span><span><i class="none"></i>No check-in</span></div>
  </div>`;
}

function weeklyBars(uidv, goalId) {
  const log = S().checkins[uidv] || {};
  const weeks = [3, 2, 1, 0].map((w) => {
    const days = Array.from({ length: 7 }, (_, i) => daysAgo(7 * w + i));
    return { label: w === 0 ? 'Past 7 days' : w === 1 ? 'Week before' : `${w} weeks back`, hits: days.filter((d) => hitFor(goalId, log[key(d)])).length };
  });
  return html`<div class="wbars">${weeks.map((w) => html`<div class="wbar"><span class="wbar-col"><i style="height:${(w.hits / 7) * 100}%" class="${w.hits >= TARGET_PER_WEEK ? 'met' : ''}"></i><b class="wbar-target" style="bottom:${(TARGET_PER_WEEK / 7) * 100}%"></b></span><strong>${w.hits}</strong><small>${w.label}</small></div>`)}</div>`;
}

export function goalPage() {
  const s = S();
  const id = meId();
  const mg = myGoal();
  const c = myCircle();
  const g = GOALS[mg?.goal || c?.goal || 'sleep'];
  const habits = s.habits[id] || [];
  const wk = weekHits(id, g.id);
  const st = streak(id, g.id);
  const cw = c ? circleWeek(c) : null;
  const commitments = c?.pastMeetings[0]?.commitments.filter((x) => x.uid === id) || [];
  const main = html`
    <header class="page-head">
      ${goalTag(g.id)}
      <h1>${mg?.title || 'Set your goal'}</h1>
      ${mg?.why ? html`<blockquote class="why">“${mg.why}”</blockquote>` : ''}
      <button class="btn btn-sm btn-outline" data-action="editGoal">${icon('edit', { size: 14 })}Edit my goal</button>
    </header>

    <section class="goal-split" aria-label="Your goal and your Circle’s goal">
      <div class="split-card">
        <span class="split-label">${icon('user', { size: 15 })}Your goal</span>
        <strong>${mg?.success || '—'}</strong>
        <small>By ${mg?.by || 'when you’re ready'}. Your habits are how you get there.</small>
      </div>
      ${c ? html`<div class="split-card is-circle" style="--g:${g.hue};--g-soft:${g.soft}">
        <span class="split-label">${icon('circle', { size: 15 })}Your Circle’s goal</span>
        <strong>${c.sharedGoal}</strong>
        <small>${cw.hits} of ${cw.target} ${g.checkin.hitLabel} in the past 7 days, together.</small>
        ${progressBar(cw.hits, cw.target, { tone: 'goal', label: 'Circle progress' })}
      </div>` : ''}
    </section>

    <section class="card" aria-labelledby="prog-h">
      <div class="card-head"><h2 id="prog-h">Your progress</h2></div>
      <div class="stats">
        <div class="stat"><strong>${wk}<small>/${TARGET_PER_WEEK}</small></strong><span>${g.checkin.hitLabel}, past 7 days</span></div>
        <div class="stat"><strong>${st}</strong><span>in a row right now</span></div>
        ${c ? html`<div class="stat"><strong>${challengeCount(c, id)}<small>/${challengeDay(c)}</small></strong><span>challenge days done</span></div>` : ''}
      </div>
      <div class="progress-viz">${weeklyBars(id, g.id)}${heatmap(id, g.id)}</div>
      <p class="muted progress-note">${wk >= TARGET_PER_WEEK ? 'You’ve hit your week. Anything else is a bonus.' : `${TARGET_PER_WEEK - wk} more in the next few days to hit your target. Missing a day is normal; missing two in a row is where it slips.`}</p>
    </section>

    <section class="card" aria-labelledby="habits-h">
      <div class="card-head"><h2 id="habits-h">Your habits</h2><button class="btn btn-sm btn-soft" data-action="addHabit">${icon('plus', { size: 14 })}Add a habit</button></div>
      <p class="muted">Yours alone. Everyone in your Circle is working toward the same thing in their own way.</p>
      <ul class="habit-manage">
        ${habits.map((h) => { const r = habitRate(id, h.id); return html`<li>
          <div><strong>${h.title}</strong>${h.challenge ? html`<span class="tag tag-challenge">${icon('flame', { size: 12 })}Challenge</span>` : ''}<small>${h.detail}</small></div>
          <div class="habit-rate"><span>${Math.round(r * 100)}%</span><small>last 2 weeks</small>${progressBar(r * 100, 100, { label: `${h.title} consistency` })}</div>
          <button class="icon-btn" data-action="removeHabit" data-id="${h.id}" aria-label="Remove ${h.title}">${icon('trash', { size: 16 })}</button>
        </li>`; })}
      </ul>
      ${habits.length === 0 ? html`<p>No habits yet. Pick one small thing you can do tonight.</p>` : ''}
    </section>

    ${commitments.length ? html`<section class="card" aria-labelledby="cm-h"><div class="card-head"><h2 id="cm-h">This week’s commitment</h2><a class="link" href="#/circle/meeting">From Sunday’s meeting</a></div>
      ${commitments.map((cm) => html`<div class="commit-big">${icon('target', { size: 18 })}<span>${cm.text}</span><button class="${cx('btn btn-sm', cm.done ? 'btn-soft on' : 'btn-outline')}" data-action="toggleCommit" data-uid="${cm.uid}">${cm.done ? 'Kept it' : 'Mark as kept'}</button></div>`)}
    </section>` : ''}`;
  const rail = html`
    <section class="card goal-library" style="--g:${g.hue};--g-soft:${g.soft};--g-deep:${g.deep}">
      <span class="gl-icon">${icon(g.icon, { size: 22 })}</span>
      <h2>Built for ${g.short.toLowerCase()}</h2>
      <p>Guides, live workshops and coaching chosen for people working on ${g.name.toLowerCase()}.</p>
      <a class="btn btn-sm btn-primary" href="#/support">Open support</a>
    </section>
    <section class="card"><div class="card-head"><h2>Ideas from your goal</h2></div>
      <ul class="idea-list">${g.habits.filter((h) => !habits.some((x) => x.id === h.id)).slice(0, 3).map((h) => html`<li><span><strong>${h.title}</strong><small>${h.detail}</small></span><button class="icon-btn" data-action="addTemplateHabit" data-id="${h.id}" aria-label="Add ${h.title}">${icon('plus', { size: 16 })}</button></li>`)}</ul>
    </section>`;
  void avatar; void daysAgo; void me;
  return { main, rail };
}

export const goalActions = {
  editGoal() { openModal('editGoal'); },
  saveGoal(form, fd) {
    set((s) => {
      const g = s.goals[meId()];
      g.title = fd.get('title') || g.title; g.why = fd.get('why'); g.success = fd.get('success') || g.success; g.by = fd.get('by') || g.by;
      s.people[meId()].focus = g.title;
      s.ui.modal = null;
    });
    toast('Goal updated');
  },
  addHabit() { openModal('addHabit'); },
  saveHabit(form, fd) {
    const title = (fd.get('title') || '').toString().trim();
    if (!title) { toast('Give your habit a name'); return; }
    set((s) => { s.habits[meId()].push({ id: uid('h'), title, detail: (fd.get('detail') || '').toString() || 'Your own habit' }); s.ui.modal = null; });
    toast('Habit added to Today');
  },
  addTemplateHabit(el) {
    const g = GOALS[myGoal()?.goal || 'sleep'];
    const h = g.habits.find((x) => x.id === el.dataset.id);
    set((s) => { s.habits[meId()].push({ ...h }); s.ui.modal = null; });
    toast(`Added “${h.title}”`);
  },
  removeHabit(el) {
    const h = S().habits[meId()].find((x) => x.id === el.dataset.id);
    set((s) => { s.habits[meId()] = s.habits[meId()].filter((x) => x.id !== el.dataset.id); });
    toast(`Removed “${h.title}”`);
  },
};
