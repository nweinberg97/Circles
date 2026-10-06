import { html, cx } from '../lib/html.js';
import { icon } from '../ui/icons.js';
import { avatar, plusTag, goalTag, dots, expertAvatar, avatarStack } from '../ui/components.js';
import { S, set, toast, closeModal, openModal, meId, me, myCircle, myGoal, person, weekHits, streak, challengeCount, challengeDay, recentDays, hitFor, uid, isLeaderOf, TARGET_PER_WEEK } from '../store.js';
import { GOALS } from '../data/goals.js';
import { RESOURCES, EXPERTS, WORKSHOPS, byGoal } from '../data/support.js';
import { ago, fmtTime, relDay, nextWeekday, key, dayName, fmtDate, addDays } from '../lib/dates.js';
import { go } from '../lib/router.js';

function shell(title, body, { size = 'md', label } = {}) {
  return html`<div class="modal-wrap" data-action="closeModal" data-self="1">
    <div class="${cx('modal', `modal-${size}`)}" role="dialog" aria-modal="true" aria-label="${label || title}" data-action="noop" data-stop="1">
      <header class="modal-head"><h2>${title}</h2><button class="icon-btn" data-action="closeModal" aria-label="Close">${icon('x', { size: 18 })}</button></header>
      <div class="modal-body">${body}</div>
    </div>
  </div>`;
}

function plusModal(m) {
  const s = S();
  const g = GOALS[myGoal()?.goal || 'sleep'];
  const plan = m.plan || 'yearly';
  const w = byGoal(WORKSHOPS, g.id)[0];
  return shell('Circles Plus', html`
    <p class="plus-lede">Your Circle stays free. Plus brings the experts in, built around ${g.name.toLowerCase()}.</p>
    <ul class="plus-list">
      ${w ? html`<li>${expertAvatar(w.expert, 'sm')}<span><strong>Live workshops every week</strong><small>Next: “${w.title}” with ${EXPERTS[w.expert].name}, ${relDay(nextWeekday(w.dow, w.time))} at ${fmtTime(w.time)}</small></span></li>` : ''}
      <li><span class="pl-icon">${icon('book', { size: 16 })}</span><span><strong>The full ${g.short.toLowerCase()} library</strong><small>Programs and guides written by the experts</small></span></li>
      <li><span class="pl-icon">${icon('message', { size: 16 })}</span><span><strong>Ask an expert</strong><small>Private questions, answered within a day</small></span></li>
      <li><span class="pl-icon">${icon('phone', { size: 16 })}</span><span><strong>A coaching call each month</strong><small>15 minutes, one-on-one</small></span></li>
      <li><span class="pl-icon">${icon('star', { size: 16 })}</span><span><strong>Member perks</strong><small>Discounts from partners our experts already recommend</small></span></li>
    </ul>
    <div class="plan-pick" role="radiogroup" aria-label="Plan">
      <button type="button" role="radio" aria-checked="${plan === 'yearly'}" class="${cx('plan-opt', plan === 'yearly' && 'on')}" data-action="pickPlan" data-value="yearly"><strong>$50 / year</strong><small>About $4.17 a month · save $10</small></button>
      <button type="button" role="radio" aria-checked="${plan === 'monthly'}" class="${cx('plan-opt', plan === 'monthly' && 'on')}" data-action="pickPlan" data-value="monthly"><strong>$5 / month</strong><small>Cancel any time</small></button>
    </div>
    <button class="btn btn-plus btn-lg wide" data-action="startPlus" data-value="${plan}">Start Plus</button>
    <p class="muted small center">Demo: no card needed. In the real app this opens checkout.</p>
  `, { size: 'sm' });
}

function memberModal(m) {
  const s = S();
  const p = person(m.id);
  const c = Object.values(s.circles).find((x) => x.memberIds.includes(m.id) && (x.id === myCircle()?.id)) || Object.values(s.circles).find((x) => x.memberIds.includes(m.id));
  const g = GOALS[c?.goal || 'sleep'];
  const mine = m.id === meId();
  const days = recentDays(m.id, 7).map((x) => (x.v ? hitFor(g.id, x.v) : null));
  const goalInfo = s.goals[m.id];
  const commit = c?.pastMeetings?.[0]?.commitments.find((x) => x.uid === m.id);
  return shell(mine ? 'You' : (c && c.leaderId === m.id ? 'Circle leader' : 'Circle member'), html`
    <div class="member-top">${avatar(p, 'xl')}<div><p class="member-name">${p.name}${c && c.leaderId === m.id ? html` <span class="tag">Leader</span>` : ''}</p><p class="muted">${p.hood}</p></div></div>
    <p class="member-focus">${icon('target', { size: 16 })}${goalInfo?.title || p.focus}</p>
    ${p.bio ? html`<p>${p.bio}</p>` : ''}
    ${goalInfo?.why ? html`<blockquote class="why">“${goalInfo.why}”</blockquote>` : ''}
    <div class="member-stats">
      <div><strong>${weekHits(m.id, g.id)}<small>/${TARGET_PER_WEEK}</small></strong><span>past 7 days</span></div>
      <div><strong>${streak(m.id, g.id)}</strong><span>in a row</span></div>
      ${c ? html`<div><strong>${challengeCount(c, m.id)}<small>/${challengeDay(c)}</small></strong><span>challenge</span></div>` : ''}
    </div>
    <div class="member-week"><span class="muted">Last 7 days</span>${dots(days, { size: 10 })}</div>
    ${commit ? html`<p class="member-commit"><span class="muted">This week’s commitment:</span> ${commit.text}</p>` : ''}
    ${!mine ? html`<div class="modal-actions"><button class="btn btn-primary" data-action="writeNote" data-id="${m.id}">${icon('heart', { size: 15 })}Send ${p.first} encouragement</button></div>` : ''}
  `, { size: 'sm' });
}

const NOTE_IDEAS = {
  member: ['Proud of you for showing up this week.', 'Missed you on Sunday. Hope you’re okay.', 'Want to check in together tomorrow night?', 'Your post last week really helped me.'],
  quiet: ['No pressure at all, just wanted to say we miss you. How are you doing?', 'Travel weeks are brutal. Want to pick one tiny habit for the road?', 'Saving you a seat on Sunday, in person or on video.'],
};

function noteModal(m) {
  const p = person(m.id);
  const quiet = m.leader;
  const ideas = quiet ? NOTE_IDEAS.quiet : NOTE_IDEAS.member;
  return shell(`A note for ${p.first}`, html`
    <form data-submit="sendNote" data-id="${m.id}">
      <p class="muted">Private, just between you two. ${quiet ? 'Notes from leaders that ask how someone is, not where they’ve been, get the most replies.' : ''}</p>
      <div class="idea-chips">${ideas.map((t) => html`<button type="button" class="chip" data-action="fillNote" data-value="${t}">${t}</button>`)}</div>
      <label class="field"><span class="field-label">Your note</span><textarea name="text" id="note-text" rows="4" required>${m.draft || ''}</textarea></label>
      <div class="modal-actions"><button class="btn btn-ghost" type="button" data-action="closeModal">Cancel</button><button class="btn btn-primary" type="submit">${icon('send', { size: 15 })}Send note</button></div>
    </form>
  `, { size: 'sm' });
}

function demoModal() {
  return shell('Restart the demo', html`
    <div class="demo-options">
      <button class="demo-opt" data-action="restartFresh">${icon('mail', { size: 18 })}<span><strong>Start as a new member</strong><small>Accept Maya’s invite and go through onboarding from the beginning.</small></span></button>
      <button class="demo-opt" data-action="restoreDemo">${icon('refresh', { size: 18 })}<span><strong>Restore the demo data</strong><small>Alex, three weeks in. Clears anything you’ve changed.</small></span></button>
      <a class="demo-opt" href="#/">${icon('home', { size: 18 })}<span><strong>Back to the overview</strong><small>The page that explains Circles and the three views.</small></span></a>
    </div>
  `, { size: 'sm' });
}

function editGoalModal() {
  const g = myGoal();
  return shell('Edit your goal', html`<form data-submit="saveGoal">
    <label class="field"><span class="field-label">Your goal</span><input name="title" value="${g.title}" required/></label>
    <label class="field"><span class="field-label">Why it matters</span><textarea name="why" rows="3">${g.why}</textarea></label>
    <label class="field"><span class="field-label">What success looks like</span><input name="success" value="${g.success}"/></label>
    <label class="field"><span class="field-label">By when</span><input name="by" value="${g.by}"/></label>
    <div class="modal-actions"><button class="btn btn-ghost" type="button" data-action="closeModal">Cancel</button><button class="btn btn-primary" type="submit">Save goal</button></div>
  </form>`, { size: 'sm' });
}

function addHabitModal() {
  const g = GOALS[myGoal()?.goal || 'sleep'];
  const have = (S().habits[meId()] || []).map((h) => h.id);
  return shell('Add a habit', html`
    <p class="muted">Ideas that work for ${g.name.toLowerCase()}:</p>
    <ul class="idea-list">${g.habits.filter((h) => !have.includes(h.id)).map((h) => html`<li><span><strong>${h.title}</strong><small>${h.detail}</small></span><button class="btn btn-sm btn-outline" data-action="addTemplateHabit" data-id="${h.id}">Add</button></li>`)}</ul>
    <form data-submit="saveHabit" class="habit-form">
      <h3 class="h3">Or your own</h3>
      <label class="field"><span class="field-label">Habit</span><input name="title" placeholder="e.g. Read 10 pages before bed"/></label>
      <label class="field"><span class="field-label">Detail (optional)</span><input name="detail" placeholder="When, where, how much"/></label>
      <div class="modal-actions"><button class="btn btn-primary" type="submit">Add habit</button></div>
    </form>`, { size: 'sm' });
}

function resourceModal(m) {
  const r = RESOURCES.find((x) => x.id === m.id);
  const s = S();
  const c = myCircle();
  const plus = s.plus[meId()]?.status === 'plus';
  const tried = c ? r.circleTried.filter((u) => c.memberIds.includes(u)) : [];
  return shell(r.name, html`
    <p class="res-m-type">${r.type} · ${r.price}</p>
    <p class="res-m-tag">${r.tagline}</p>
    <h3 class="h3">Why it’s here</h3><p>${r.why}</p>
    <div class="res-m-signals">
      ${r.expertPick ? html`<div>${expertAvatar(r.expertPick, 'sm')}<span><strong>Expert pick</strong><small>${EXPERTS[r.expertPick].name}, ${EXPERTS[r.expertPick].role}</small></span></div>` : ''}
      <div><span class="pl-icon">${icon('star', { size: 16 })}</span><span><strong>${r.tested.score} out of 5</strong><small>from ${r.tested.n} members working on the same goal</small></span></div>
      ${tried.length ? html`<div>${avatarStack(tried, { size: 'xs' })}<span><strong>Tried in your Circle</strong><small>${tried.map((u) => (u === meId() ? 'You' : person(u).first)).join(', ')}</small></span></div>` : ''}
    </div>
    <div class="${cx('disclosure', r.partner ? 'is-partner' : 'is-indie')}">${icon(r.partner ? 'info' : 'shield', { size: 16 })}<p>${r.partner ? 'Circles partner. We earn a small commission if you buy through us. It doesn’t affect where this appears; expert review and member ratings decide the order.' : 'No affiliation. We don’t earn anything from this recommendation.'}</p></div>
    ${r.perk ? html`<div class="perk-box">${plus ? html`${icon('sparkles', { size: 16 })}<span><strong>Your Plus perk:</strong> ${r.perk}</span>` : html`${icon('lock', { size: 16 })}<span><strong>Plus perk:</strong> ${r.perk}</span><button class="btn btn-sm btn-plus" data-action="openPlus">Unlock</button>`}</div>` : ''}
    <div class="modal-actions">
      ${c ? html`<button class="btn btn-ghost" data-action="shareResource" data-id="${r.id}">${icon('send', { size: 15 })}Ask my Circle about it</button>` : ''}
      <button class="btn btn-primary" data-action="visitResource">${r.type === 'Coaching' ? 'Book a call' : 'Visit site'} ${icon('external', { size: 14 })}</button>
    </div>`, { size: 'sm' });
}

function howModal() {
  return shell('How we choose recommendations', html`
    <ol class="policy">
      <li><strong>Experts review first.</strong> Every product, app and service is checked by a specialist in that goal before it can appear.</li>
      <li><strong>Members rate what they’ve used.</strong> Ratings only come from members working on the same goal, after they’ve tried it.</li>
      <li><strong>Order is earned, not bought.</strong> Expert picks and member ratings decide the order. Partnerships never do.</li>
      <li><strong>Partners are labelled.</strong> If we earn money from a recommendation, it says “Partner” and explains how.</li>
      <li><strong>We take things down.</strong> If ratings drop or experts change their minds, it goes, partner or not.</li>
    </ol>`, { size: 'sm' });
}

function suggestModal() {
  const c = myCircle();
  return shell('Suggest a friend', html`<form data-submit="suggestSend">
    <p class="muted">${c.memberIds.length >= c.size ? `${c.name} is full, so ${person(c.leaderId).first} may start a sister Circle for them.` : `${person(c.leaderId).first} will send the invite, so the Circle stays invite-only.`}</p>
    <label class="field"><span class="field-label">Their email</span><input name="email" type="email" required placeholder="friend@email.com"/></label>
    <label class="field"><span class="field-label">A line for ${person(c.leaderId).first} (optional)</span><input name="why" placeholder="Why they’d be a good fit"/></label>
    <div class="modal-actions"><button class="btn btn-primary" type="submit">Send suggestion</button></div>
  </form>`, { size: 'sm' });
}

function inviteModal() {
  const c = myCircle();
  return shell('Invite to your Circle', html`
    <p class="muted">${c.memberIds.length} of ${c.size} seats taken.</p>
    <form class="invite-form" data-submit="sendInvite"><input name="email" type="email" placeholder="friend@email.com" aria-label="Email" required/><button class="btn btn-primary btn-sm" type="submit">Send</button></form>
    <p class="muted small">Your Circle is full? <a href="#/lead/members">Start a sister Circle</a> from the waitlist.</p>`, { size: 'sm' });
}

function runMeetingModal(m) {
  const c = myCircle();
  const st = (S().ui.run = S().ui.run || { step: 0, present: c.memberIds.filter((x) => c.rsvp[x] === 'yes'), commits: {} });
  const item = c.agenda[st.step];
  const last = st.step >= c.agenda.length;
  return shell(last ? 'Wrap up' : `${st.step + 1}. ${item.title}`, html`
    <div class="run-progress">${c.agenda.map((a, i) => html`<span class="${cx(i < st.step && 'done', i === st.step && 'now')}" title="${a.title}"></span>`)}</div>
    ${!last ? html`
      <p class="run-mins">${icon('clock', { size: 16 })}${item.mins} minutes</p>
      ${st.step === 0 ? html`<h3 class="h3">Who’s here?</h3><div class="present">${c.memberIds.map((x) => html`<button type="button" class="${cx('pick', st.present.includes(x) && 'on')}" aria-pressed="${st.present.includes(x)}" data-action="runPresent" data-id="${x}">${avatar(x, 'xs')}${person(x).first}</button>`)}</div>` : ''}
      ${/commit/i.test(item.title) ? html`<h3 class="h3">Commitments for this week</h3><div class="commit-inputs">${st.present.map((x) => html`<label class="field field-inline">${avatar(x, 'xs')}<span>${person(x).first}</span><input data-bind="ui.run.commits.${x}" value="${st.commits[x] || ''}" placeholder="One small, specific thing"/></label>`)}</div>` : ''}
      ${!/commit/i.test(item.title) && st.step !== 0 ? html`<p class="muted">Facilitator tip: ${tip(item.title)}</p>` : ''}
      <div class="modal-actions"><button class="btn btn-ghost" data-action="runBack" ${st.step === 0 ? 'disabled' : ''}>Back</button><button class="btn btn-primary" data-action="runNext">Next ${icon('arrowRight', { size: 15 })}</button></div>
    ` : html`
      <p>${st.present.length} of ${c.memberIds.length} came. ${Object.values(st.commits).filter(Boolean).length} commitments captured.</p>
      <label class="field"><span class="field-label">Notes for the Circle</span><textarea rows="3" data-bind="ui.run.notes" placeholder="What did we talk about? What are we trying next?">${st.notes || ''}</textarea></label>
      <div class="modal-actions"><button class="btn btn-ghost" data-action="runBack">Back</button><button class="btn btn-primary" data-action="runFinish">${icon('send', { size: 15 })}Save and share recap</button></div>`}
  `, { size: 'md' });
}
function tip(t) {
  if (/well/i.test(t)) return 'Go around the circle. Celebrate specifics, not just outcomes.';
  if (/difficult/i.test(t)) return 'Ask “what got in the way?” rather than “why didn’t you?”. Invite advice only if they want it.';
  if (/working on/i.test(t)) return 'Keep it to one thing each. Small and specific wins.';
  if (/challenge/i.test(t)) return 'Share the Circle’s numbers from this week and pick the next challenge together.';
  return 'Keep it light. This is the part people remember.';
}

function cancelPlusModal() {
  return shell('Cancel Plus?', html`
    <p>Your Circle, meetings and challenges stay exactly as they are. You’d lose workshops, the full library, Ask an expert and coaching at the end of this billing period.</p>
    <div class="modal-actions"><button class="btn btn-ghost" data-action="closeModal">Keep Plus</button><button class="btn btn-danger" data-action="confirmCancel">Cancel Plus</button></div>`, { size: 'sm' });
}

function assignLeaderModal(m) {
  const org = S().org;
  const c = org.circles.find((x) => x.id === m.id);
  const options = [...org.volunteers.map((v) => ({ name: v.name, note: `${v.team} · volunteered · ${v.note}` })), ...org.leaders.filter((l) => l.circles < 2 && l.trained === true).slice(0, 3).map((l) => ({ name: l.name, note: `${l.team} · already leads 1 Circle` }))];
  return shell(`Leader for ${c.name}`, html`<form data-submit="confirmAssign" data-id="${c.id}">
    <fieldset class="field"><legend class="field-label">Choose someone</legend>
      ${options.map((o, i) => html`<label class="radio-row"><input type="radio" name="leader" value="${o.name}" ${(m.preselect ? o.name === m.preselect : i === 0) ? 'checked' : ''}/><span><strong>${o.name}</strong><small>${o.note}</small></span></label>`)}
    </fieldset>
    <p class="muted small">They’ll get leader training, a 15-minute coach call and a ready-made first month.</p>
    <div class="modal-actions"><button class="btn btn-primary" type="submit">Assign leader</button></div>
  </form>`, { size: 'sm' });
}

const PLAYBOOK = {
  first: { t: 'Running a great first meeting', b: ['Start with names and one sentence on why each person is here. Write the why down; you’ll use it later.', 'Agree the shared goal out loud, then let everyone pick their own first habit.', 'End ten minutes early. People should leave wanting more, not checking the time.'] },
  quiet: { t: 'Reaching out to a quiet member', b: ['Message privately, never in the group.', 'Ask how they are, not where they’ve been. “We miss you” beats “you missed”.', 'Offer a smaller version of the goal. A bad week is the most important week to stay connected.'] },
  slump: { t: 'When the whole Circle slumps', b: ['Name it at the meeting: “This was a hard week for all of us.” Relief is contagious.', 'Shrink the challenge. Three days instead of seven.', 'Do something fun together that isn’t the goal at all.'] },
  handoff: { t: 'Handing off leadership', b: ['Ask early, privately, and say why you thought of them.', 'Co-lead for two meetings before you step back.', 'Stay in the Circle as a member if you can.'] },
};
function playbookModal(m) {
  const p = PLAYBOOK[m.id];
  return shell(p.t, html`<ol class="policy">${p.b.map((x) => html`<li>${x}</li>`)}</ol>`, { size: 'sm' });
}

export function renderModal(m) {
  if (!m) return '';
  const R = { plus: plusModal, member: memberModal, note: noteModal, demo: demoModal, editGoal: editGoalModal, addHabit: addHabitModal, resource: resourceModal, howWeChoose: howModal, suggest: suggestModal, invite: inviteModal, runMeeting: runMeetingModal, cancelPlus: cancelPlusModal, assignLeader: assignLeaderModal, playbook: playbookModal };
  return R[m.type] ? R[m.type](m) : '';
}

export const modalActions = {
  pickPlan(el) { set((s) => { s.ui.modal.plan = el.dataset.value; }); },
  startPlus(el) {
    set((s) => { s.plus[meId()] = { status: 'plus', plan: el.dataset.value, since: fmtDate(new Date(), { weekday: false }) }; s.ui.modal = null; });
    toast('Welcome to Plus. Everything is unlocked.');
  },
  writeNote(el) { openModal('note', { id: el.dataset.id }); },
  fillNote(el) { const t = document.getElementById('note-text'); if (t) { t.value = el.dataset.value; t.focus(); } },
  sendNote(form, fd) {
    const text = (fd.get('text') || '').toString().trim();
    if (!text) return;
    const to = form.dataset.id;
    set((s) => {
      s.notes.unshift({ id: uid('n'), from: meId(), to, at: Date.now(), text });
      s.ui.modal = null;
      s.ui.nudged = { ...(s.ui.nudged || {}), [to]: true };
    });
    toast(`Note sent to ${person(to).first}`);
    if (to === 'u_taylor') {
      setTimeout(() => {
        set((s) => {
          s.notes.unshift({ id: uid('n'), from: 'u_taylor', to: meId(), at: Date.now(), text: 'Thank you, honestly needed that. Home Thursday. I’ll be there Sunday.' });
          s.circles.c_sleep.rsvp.u_taylor = 'yes';
          s.people.u_taylor.lastActive = Date.now();
        });
        toast('Taylor replied: they’ll be there Sunday');
      }, 3500);
    }
  },
  shareResource(el) {
    const r = RESOURCES.find((x) => x.id === el.dataset.id);
    const c = myCircle();
    set((s) => { s.posts.unshift({ id: uid('p'), circleId: c.id, uid: meId(), type: 'question', at: Date.now(), text: `Has anyone tried ${r.name}? ${r.tagline}. Thinking about it.`, cheers: [], metoo: [], replies: [] }); s.ui.modal = null; });
    toast('Asked your Circle');
  },
  visitResource() { toast('Opens the partner’s site in a new tab'); },
  suggestSend(form, fd) { set((s) => { s.ui.modal = null; }); toast(`Suggestion sent to ${person(myCircle().leaderId).first}`); },
  runPresent(el) { set((s) => { const r = s.ui.run; const x = el.dataset.id; r.present = r.present.includes(x) ? r.present.filter((y) => y !== x) : [...r.present, x]; }); },
  runNext() { set((s) => { s.ui.run.step += 1; }); },
  runBack() { set((s) => { s.ui.run.step = Math.max(0, s.ui.run.step - 1); }); },
  runFinish() {
    const c = myCircle();
    set((s) => {
      const r = s.ui.run;
      const commitments = Object.entries(r.commits).filter(([, t]) => t).map(([u, t]) => ({ uid: u, text: t }));
      c.pastMeetings.unshift({ id: uid('m'), daysAgo: 0, attended: r.present, notes: r.notes || 'Good meeting. See you next week.', commitments });
      s.posts.unshift({ id: uid('p'), circleId: c.id, uid: meId(), type: 'announcement', pinned: false, at: Date.now(), text: `Recap: ${r.present.length} of us made it. ${r.notes || ''} ${commitments.length ? `${commitments.length} commitments are on the meeting page.` : ''}`.replace(/\s+/g, ' ').trim(), cheers: [], metoo: [], replies: [] });
      s.ui.run = null; s.ui.modal = null;
    });
    toast('Recap shared with your Circle');
  },
};

void goalTag; void plusTag; void me; void ago; void isLeaderOf; void key; void dayName; void addDays; void go;
