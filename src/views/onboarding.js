import { html, cx } from '../lib/html.js';
import { icon } from '../ui/icons.js';
import { wordmark, avatar, avatarStack, goalTag, seats } from '../ui/components.js';
import { S, set, person, toast, uid } from '../store.js';
import { go } from '../lib/router.js';
import { GOALS, GOAL_LIST } from '../data/goals.js';
import { fmtTime, dayName, hoursAgo, key } from '../lib/dates.js';

const STEPS = ['Welcome', 'Goal', 'Why', 'Rhythm', 'Circle', 'Meet', 'Commit'];

function ob() {
  const s = S();
  if (!s.ob) s.ob = { step: 0, goal: 'sleep', why: '', success: '', format: 'Either', times: ['Weekends'], circleId: 'c_sleep', habits: ['phone-kitchen', 'wind-down'], custom: '', joinChallenge: true, name: 'Alex Chen' };
  return s.ob;
}

function matchesFor(o) {
  const s = S();
  return Object.values(s.circles)
    .filter((c) => c.goal === o.goal)
    .map((c) => {
      const reasons = [];
      reasons.push('Same goal');
      if (c.time && o.times.includes(c.time)) reasons.push(`${c.time} work for you`);
      if (o.format === 'Either' || c.format === o.format || c.format === 'Hybrid') reasons.push(c.format === 'Online' ? 'Meets online' : c.format === 'Hybrid' ? 'In person or online' : 'Meets in person');
      if (c.id === 'c_sleep') reasons.unshift('Maya invited you');
      return { c, reasons };
    })
    .sort((a, b) => (b.c.id === 'c_sleep') - (a.c.id === 'c_sleep') || b.reasons.length - a.reasons.length);
}

function side(o) {
  const s = S();
  const c = s.circles[o.circleId];
  const g = GOALS[o.goal];
  const showCircle = c && c.goal === o.goal;
  return html`<aside class="ob-side" style="--g:${g.hue};--g-soft:${g.soft}">
    ${wordmark()}
    ${showCircle ? html`
      <div class="ob-circle">
        <div class="ob-ring">
          ${Array.from({ length: c.size }, (_, i) => {
            const a = (-90 + (360 / c.size) * i) * (Math.PI / 180);
            const id = c.memberIds[i];
            const pos = `left:${50 + 40 * Math.cos(a)}%;top:${50 + 40 * Math.sin(a)}%`;
            if (id) return html`<span class="ob-seat" style="${pos}">${avatar(id, 'md')}</span>`;
            if (i === c.memberIds.length) return html`<span class="ob-seat ob-you" style="${pos}"><span class="av av-md av-you">${o.step >= 5 ? 'You' : '?'}</span></span>`;
            return html`<span class="ob-seat ob-empty" style="${pos}"><span></span></span>`;
          })}
          <div class="ob-ring-core">${icon(g.icon, { size: 22 })}<span>${c.name.replace(' — ', '\n')}</span></div>
        </div>
        <p class="ob-side-note">${o.step < 4 ? html`<strong>${person(c.leaderId).first}</strong> saved you a seat.` : html`${c.memberIds.length} people, one goal: ${c.sharedGoal.toLowerCase()}.`}</p>
      </div>` : html`<div class="ob-goal-art">${icon(g.icon, { size: 56 })}<p>${g.pitch}</p></div>`}
  </aside>`;
}

function stepWelcome(o) {
  const s = S();
  const maya = person('u_maya');
  return html`
    <div class="ob-invite">
      ${avatar(maya, 'lg')}
      <div><p class="ob-from"><strong>${maya.name}</strong> invited you to join</p><p class="ob-circle-name">Better Sleep — Vancouver</p></div>
    </div>
    <blockquote class="ob-quote">“Alex! Remember complaining about your phone at 1 AM? A few of us are fixing our sleep together. Sundays, coffee, no judgement. There’s a seat with your name on it.”</blockquote>
    <h1>Welcome to Circles.</h1>
    <p class="ob-lede">A Circle is a small group of people working toward the same health goal. You keep your own habits; you share the goal, a weekly meeting, and a lot of encouragement.</p>
    <ul class="ob-facts">
      <li>${icon('users')}<span><strong>6 people</strong> already in this Circle</span></li>
      <li>${icon('calendar')}<span><strong>Sundays, 10 AM</strong> at Bean Around the World or on video</span></li>
      <li>${icon('shield')}<span><strong>Private.</strong> Only your Circle sees your check-ins</span></li>
    </ul>
    ${field('Your name', 'name', o.name)}
    <div class="ob-actions"><button class="btn btn-primary btn-lg" data-action="obNext">Accept invitation ${icon('arrowRight', { size: 18 })}</button></div>`;
}

function field(label, name, value) {
  return html`<label class="field"><span class="field-label">${label}</span><input name="${name}" value="${value}" data-bind="ob.${name}" autocomplete="name"/></label>`;
}

function stepGoal(o) {
  return html`
    <h1>What would you like to work on?</h1>
    <p class="ob-lede">Maya’s Circle is about sleep. If something else matters more right now, pick it and we’ll find you the right people.</p>
    <div class="goal-pick" role="radiogroup" aria-label="Goal">
      ${GOAL_LIST.map((g) => html`<button type="button" role="radio" aria-checked="${o.goal === g.id}" class="${cx('goal-opt', o.goal === g.id && 'on')}" style="--g:${g.hue};--g-soft:${g.soft};--g-deep:${g.deep}" data-action="obGoal" data-value="${g.id}">
        <span class="goal-opt-icon">${icon(g.icon, { size: 22 })}</span><strong>${g.name}</strong><span>${g.pitch}</span>
        ${g.id === 'sleep' ? html`<em>Maya’s Circle</em>` : ''}
      </button>`)}
    </div>
    ${nav()}`;
}

function chips(list, bindKey) {
  return html`<div class="idea-chips">${list.map((t) => html`<button type="button" class="chip" data-action="obIdea" data-key="${bindKey}" data-value="${t}">${icon('plus', { size: 13 })}${t}</button>`)}</div>`;
}

function stepWhy(o) {
  const g = GOALS[o.goal];
  return html`
    <h1>Why does this matter to you?</h1>
    <p class="ob-lede">Your Circle sees this on your profile. It’s what they’ll remind you of on the hard days.</p>
    <label class="field"><span class="field-label">In your own words</span><textarea rows="3" data-bind="ob.why" data-focus="ob-why" placeholder="I want…">${o.why}</textarea></label>
    ${chips(g.whyIdeas, 'why')}
    <h2 class="ob-h2">What does success look like?</h2>
    <label class="field"><span class="field-label">Something you’ll be able to see</span><input data-bind="ob.success" data-focus="ob-success" value="${o.success}" placeholder="${g.successIdeas[0]}"/></label>
    ${chips(g.successIdeas, 'success')}
    ${nav({ skip: true })}`;
}

function stepRhythm(o) {
  const times = ['Mornings', 'Lunch', 'Evenings', 'Weekends'];
  return html`
    <h1>How do you like to work?</h1>
    <p class="ob-lede">We use this to suggest Circles whose rhythm fits your life. You can change it any time.</p>
    <fieldset class="ob-set"><legend>Where should your Circle meet?</legend>
      <div class="seg seg-lg">${['In person', 'Online', 'Either'].map((f) => html`<button type="button" class="${cx('seg-btn', o.format === f && 'on')}" aria-pressed="${o.format === f}" data-action="obSet" data-key="format" data-value="${f}">${f}</button>`)}</div>
    </fieldset>
    <fieldset class="ob-set"><legend>When are you usually free? <span class="muted">Pick any</span></legend>
      <div class="pick-row">${times.map((t) => html`<button type="button" class="${cx('pick', o.times.includes(t) && 'on')}" aria-pressed="${o.times.includes(t)}" data-action="obTime" data-value="${t}">${o.times.includes(t) ? icon('check', { size: 15 }) : ''}${t}</button>`)}</div>
    </fieldset>
    ${nav()}`;
}

function stepCircle(o) {
  const ms = matchesFor(o);
  return html`
    <h1>${o.goal === 'sleep' ? 'Your Circle is waiting' : 'Circles that fit'}</h1>
    <p class="ob-lede">${o.goal === 'sleep' ? 'Maya’s Circle matches what you told us. There are others if you’d rather.' : 'Circles are invite-only, so you’ll ask the leader to join. Most reply within a day.'}</p>
    <div class="match-list" role="radiogroup" aria-label="Choose a Circle">
      ${ms.map(({ c, reasons }) => html`
        <button type="button" role="radio" aria-checked="${o.circleId === c.id}" class="${cx('match', o.circleId === c.id && 'on')}" data-action="obCircle" data-value="${c.id}">
          <span class="match-top"><strong>${c.name}</strong>${seats(c.memberIds.length, c.size)}</span>
          <span class="match-goal">${c.sharedGoal}</span>
          <span class="match-meta">${icon('calendar', { size: 14 })}${dayName(c.rhythm.dow)}s, ${fmtTime(c.rhythm.time)} ${icon('pin', { size: 14 })}${c.place}</span>
          <span class="match-why">${reasons.map((r) => html`<span>${icon('check', { size: 12 })}${r}</span>`)}</span>
          <span class="match-people">${avatarStack(c.memberIds, { max: 6, size: 'xs' })}<span>Led by ${person(c.leaderId).first}</span></span>
        </button>`)}
      ${ms.length === 0 ? html`<p class="muted">No Circles for this goal near you yet. You can start one after onboarding.</p>` : ''}
    </div>
    ${nav({ next: o.circleId && S().circles[o.circleId]?.goal === o.goal ? (o.circleId === 'c_sleep' ? 'Join this Circle' : 'Ask to join') : null })}`;
}

function stepMeet(o) {
  const c = S().circles[o.circleId];
  const leader = person(c.leaderId);
  return html`
    ${c.id !== 'c_sleep' ? html`<p class="accepted">${icon('check', { size: 15 })}${leader.first} accepted your request</p>` : ''}
    <h1>Meet your Circle</h1>
    <p class="ob-lede">${c.sharedGoal}. Everyone’s working on their own piece of it.</p>
    <div class="leader-welcome">${avatar(leader, 'md')}<div><strong>${leader.first}, your Circle leader</strong><p>${c.id === 'c_sleep' ? '“So glad you’re here. Sunday’s low-key: coffee, a check-in, and we pick our commitments for the week. Come as you are.”' : `“Welcome! Our next meetup is ${dayName(c.rhythm.dow)} at ${fmtTime(c.rhythm.time)}. Come as you are.”`}</p></div></div>
    <ul class="meet-list">
      ${c.memberIds.map((id) => { const p = person(id); return html`<li>${avatar(p, 'md')}<span><strong>${p.first}${id === c.leaderId ? html` <span class="tag">Leader</span>` : ''}</strong><small>${p.focus}</small></span><span class="meet-hood">${p.hood}</span></li>`; })}
    </ul>
    <div class="next-meet">${icon('calendar')}<span>Your first meeting: <strong>${dayName(c.rhythm.dow)}, ${fmtTime(c.rhythm.time)}</strong>${c.rhythm.venue ? ` at ${c.rhythm.venue}` : ' on video'}</span></div>
    ${nav({ next: 'Set my first habits' })}`;
}

function stepCommit(o) {
  const g = GOALS[o.goal];
  const c = S().circles[o.circleId];
  return html`
    <h1>Pick one to three habits to start</h1>
    <p class="ob-lede">Small and specific beats ambitious. Your Circle shares the goal; these are just yours.</p>
    <div class="habit-pick">
      ${g.habits.map((h) => { const on = o.habits.includes(h.id); return html`<button type="button" class="${cx('habit-opt', on && 'on')}" aria-pressed="${on}" data-action="obHabit" data-value="${h.id}"><span class="check-box">${on ? icon('check', { size: 14 }) : ''}</span><span><strong>${h.title}</strong><small>${h.detail}</small></span></button>`; })}
    </div>
    <label class="field"><span class="field-label">Or write your own</span><input data-bind="ob.custom" data-focus="ob-custom" value="${o.custom}" placeholder="e.g. Read 10 pages before bed"/></label>
    ${c ? html`<label class="toggle-row"><input type="checkbox" ${o.joinChallenge ? 'checked' : ''} data-bind="ob.joinChallenge"/><span><strong>Join the ${c.challenge.title}</strong><small>Your Circle is on day ${Math.min(c.challenge.startedDaysAgo + 1, c.challenge.days)}. Jump in tonight; nobody’s counting from day one.</small></span></label>` : ''}
    <div class="ob-actions"><button class="btn btn-ghost" data-action="obBack">${icon('arrowLeft', { size: 18 })}Back</button><button class="btn btn-primary btn-lg" data-action="obFinish" ${o.habits.length || o.custom ? '' : 'disabled'}>Enter my Circle ${icon('arrowRight', { size: 18 })}</button></div>`;
}

function nav({ skip = false, next = 'Continue' } = {}) {
  return html`<div class="ob-actions">
    <button class="btn btn-ghost" data-action="obBack">${icon('arrowLeft', { size: 18 })}Back</button>
    ${skip ? html`<button class="btn btn-link" data-action="obNext">Skip for now</button>` : ''}
    ${next ? html`<button class="btn btn-primary btn-lg" data-action="obNext">${next} ${icon('arrowRight', { size: 18 })}</button>` : ''}
  </div>`;
}

export function onboarding() {
  const o = ob();
  const steps = [stepWelcome, stepGoal, stepWhy, stepRhythm, stepCircle, stepMeet, stepCommit];
  const body = steps[o.step](o);
  return html`<div class="onboarding">
    <div class="demo-bar demo-bar-ob"><span class="demo-label"><span class="demo-dot"></span>Demo · New member onboarding</span><a href="#/" class="demo-more">Exit to overview</a></div>
    <div class="ob-wrap">
      ${side(o)}
      <main class="ob-main" id="main">
        <div class="ob-progress" aria-label="Step ${o.step + 1} of ${STEPS.length}">
          ${STEPS.map((st, i) => html`<span class="${cx(i < o.step && 'done', i === o.step && 'now')}" title="${st}"></span>`)}
          <small>${o.step + 1} of ${STEPS.length}</small>
        </div>
        <div class="ob-body" key="${o.step}">${body}</div>
      </main>
    </div>
  </div>`;
}

export const onboardingActions = {
  obNext() {
    set((s) => { const o = ob(); o.step = Math.min(o.step + 1, STEPS.length - 1); });
  },
  obBack() {
    set((s) => { const o = ob(); if (o.step === 0) return; o.step -= 1; });
    if (ob().step === 0 && false) go('/');
  },
  obGoal(el) {
    set(() => {
      const o = ob();
      o.goal = el.dataset.value;
      const first = matchesFor(o)[0];
      o.circleId = first ? first.c.id : null;
      o.habits = GOALS[o.goal].habits.slice(0, 2).map((h) => h.id);
      o.why = ''; o.success = '';
    });
  },
  obIdea(el) {
    set(() => {
      const o = ob();
      const k = el.dataset.key;
      o[k] = k === 'why' && o.why ? `${o.why.replace(/[.\s]+$/, '')}. ${el.dataset.value}.` : el.dataset.value;
    });
  },
  obSet(el) { set(() => { ob()[el.dataset.key] = el.dataset.value; }); },
  obTime(el) {
    set(() => { const o = ob(); const v = el.dataset.value; o.times = o.times.includes(v) ? o.times.filter((t) => t !== v) : [...o.times, v]; });
  },
  obCircle(el) { set(() => { ob().circleId = el.dataset.value; }); },
  obHabit(el) {
    set(() => {
      const o = ob(); const v = el.dataset.value;
      if (o.habits.includes(v)) o.habits = o.habits.filter((h) => h !== v);
      else if (o.habits.length < 3) o.habits = [...o.habits, v];
      else toast('Three is plenty to start. Untick one to swap.');
    });
  },
  obFinish() {
    const o = ob();
    set((s) => {
      const g = GOALS[o.goal];
      const me = s.people.u_alex;
      if (o.name?.trim()) {
        me.name = o.name.trim(); me.first = me.name.split(' ')[0];
        me.initials = me.name.split(' ').map((x) => x[0]).slice(0, 2).join('').toUpperCase();
      }
      me.focus = o.success || g.successIdeas[0];
      me.lastActive = Date.now();
      const c = s.circles[o.circleId];
      if (!c.memberIds.includes('u_alex')) c.memberIds.push('u_alex');
      c.invites = (c.invites || []).filter((i) => i.uid !== 'u_alex');
      if (c.id !== 'c_sleep') {
        const sleep = s.circles.c_sleep; sleep.invites = (sleep.invites || []).filter((i) => i.uid !== 'u_alex');
      }
      s.myCircle.u_alex = c.id;
      s.goals.u_alex = { goal: o.goal, title: o.success || g.successIdeas[0], why: o.why, success: o.success || g.successIdeas[0], by: 'End of November', prefs: { format: o.format, times: o.times } };
      const habits = g.habits.filter((h) => o.habits.includes(h.id)).map((h) => ({ ...h }));
      if (o.custom.trim()) habits.push({ id: uid('h'), title: o.custom.trim(), detail: 'Your own habit' });
      if (o.joinChallenge) {
        const existing = habits.find((h) => c.challenge.id.startsWith(h.id));
        if (existing) existing.challenge = true;
        else habits.unshift({ id: 'challenge', title: c.challenge.title.replace(/^\d+-Day /, ''), detail: c.challenge.action, challenge: true });
        s.challengeLog[c.id].u_alex = Array(c.challenge.startedDaysAgo).fill(false);
      }
      s.habits.u_alex = habits;
      s.habitLog.u_alex = {};
      s.checkins.u_alex = {};
      s.onboarded = true;
      s.persona = 'member';
      const leader = s.people[c.leaderId];
      s.posts.unshift({ id: uid('p'), circleId: c.id, uid: c.leaderId, type: 'announcement', at: Date.now() - 60000, text: `Everyone, please welcome ${me.first}! ${o.why ? `In ${me.first}’s words: “${o.why.trim()}”` : `${me.first} is working on: ${me.focus.toLowerCase()}.`} See you ${dayName(c.rhythm.dow)}.`, cheers: c.memberIds.filter((m) => m !== c.leaderId && m !== 'u_alex').slice(0, 4), metoo: [], replies: [{ id: uid('r'), uid: c.memberIds.find((m) => m !== c.leaderId && m !== 'u_alex'), at: Date.now() - 30000, text: `Welcome ${me.first}! You picked a good week to join.` }] });
      s.ui.welcome = true;
      delete s.ob;
      void leader; void hoursAgo; void key;
    }, { render: false });
    go('/circle');
  },
};
