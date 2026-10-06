import { html, cx } from '../lib/html.js';
import { icon } from '../ui/icons.js';
import { goalTag, progressBar, seats, emptyState } from '../ui/components.js';
import { S, set, toast, uid, openModal } from '../store.js';
import { GOALS, GOAL_LIST } from '../data/goals.js';
import { greeting } from '../lib/dates.js';
import { go } from '../lib/router.js';

const o = () => S().org;
const progCircles = (pid) => o().circles.filter((c) => c.programId === pid);
const inProg = (u, pid) => (u.programId ? u.programId === pid : pid === 'pr_run');
const avg = (xs) => (xs.length ? Math.round(xs.reduce((a, b) => a + b, 0) / xs.length) : 0);
const active = (cs) => cs.filter((c) => c.leader && c.engagement > 0);

function trendChart(values) {
  const w = 560, h = 250, pad = 30, padL = 44;
  const max = 100;
  const step = (w - padL - pad) / (values.length - 1);
  const pts = values.map((v, i) => [padL + i * step, h - pad - (v / max) * (h - pad * 2)]);
  const line = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join('');
  const area = `${line}L${pts[pts.length - 1][0]} ${h - pad}L${pts[0][0]} ${h - pad}Z`;
  return html`<svg class="trend" viewBox="0 0 ${w} ${h}" role="img" aria-label="Weekly active members, last 8 weeks: ${values.join(', ')} percent">
    ${[25, 50, 75, 100].map((g) => html`<line x1="${padL}" x2="${w - pad}" y1="${h - pad - (g / max) * (h - pad * 2)}" y2="${h - pad - (g / max) * (h - pad * 2)}" class="trend-grid"/><text x="${padL - 8}" y="${h - pad - (g / max) * (h - pad * 2) + 4}" class="trend-lbl" text-anchor="end">${g}%</text>`)}
    <path d="${area}" class="trend-area"/><path d="${line}" class="trend-line"/>
    ${pts.map((p, i) => html`<circle cx="${p[0]}" cy="${p[1]}" r="${i === pts.length - 1 ? 5 : 3}" class="${cx('trend-dot', i === pts.length - 1 && 'last')}"/><text x="${p[0]}" y="${h - 8}" class="trend-lbl" text-anchor="middle">${i === pts.length - 1 ? 'This wk' : `W${i + 1}`}</text>`)}
    <text x="${pts[pts.length - 1][0] - 8}" y="${pts[pts.length - 1][1] - 12}" class="trend-val" text-anchor="end">${values[values.length - 1]}%</text>
  </svg>`;
}

function circleRow(c) {
  const p = o().programs.find((x) => x.id === c.programId);
  return html`<div class="ocrow" role="row">
    <span role="cell" class="oc-name"><strong>${c.name}</strong><small>${p?.name}</small></span>
    <span role="cell">${c.leader ? c.leader : html`<button class="btn btn-sm btn-outline" data-action="assignLeader" data-id="${c.id}">Assign leader</button>`}</span>
    <span role="cell">${seats(c.members, c.size)}</span>
    <span role="cell" class="oc-meter">${c.engagement ? html`${progressBar(c.engagement, 100, { label: 'Weekly check-ins' })}<small>${c.engagement}%</small>` : html`<small class="muted">Not started</small>`}</span>
    <span role="cell">${c.attendance ? `${c.attendance}%` : '—'}</span>
    <span role="cell">${c.flag ? html`<span class="status st-watch">${c.flag}</span>` : c.engagement ? html`<span class="status st-good">Healthy</span>` : html`<span class="status st-ok">Getting started</span>`}</span>
  </div>`;
}

function circlesTable(cs) {
  return html`<div class="octable" role="table" aria-label="Circles">
    <div class="ocrow ochead" role="row"><span role="columnheader">Circle</span><span role="columnheader">Leader</span><span role="columnheader">Members</span><span role="columnheader">Weekly check-ins</span><span role="columnheader">Attendance</span><span role="columnheader">Health</span></div>
    ${cs.map(circleRow)}
  </div>`;
}

function privacyNote() {
  return html`<p class="privacy-line">${icon('shield', { size: 16 })}You see participation totals only. ${o().name} never sees anyone’s goals, check-ins or conversations, and groups smaller than five are rolled up.</p>`;
}

function overview() {
  const org = o();
  const cs = org.circles;
  const members = cs.reduce((n, c) => n + c.members, 0);
  const a = active(cs);
  const attention = [];
  cs.filter((c) => !c.leader).forEach((c) => attention.push({ icon: 'userPlus', title: `${c.name} needs a leader`, body: `${org.volunteers.length} people have volunteered to lead.`, cta: 'Assign a leader', action: 'assignLeader', id: c.id }));
  cs.filter((c) => c.leader && c.flag).forEach((c) => attention.push({ icon: 'chart', title: `${c.name}: ${c.flag.toLowerCase()}`, body: `${c.leader} hasn’t done leader training yet. A 15-minute coaching call usually helps.`, cta: `Offer ${c.leader.split(' ')[0]} coaching`, action: 'offerCoaching', id: c.id }));
  if (org.unplaced.length) attention.push({ icon: 'users', title: `${org.unplaced.length} people signed up but aren’t in a Circle`, body: 'We can group them by when they’re free and suggest leaders.', cta: 'Review groups', action: 'navOrg', id: (org.unplaced[0].programId || 'pr_run') });
  return html`
    <header class="page-head"><p class="muted">${org.name} · wellbeing programs</p><h1>${greeting()}, ${org.admin.name.split(' ')[0]}.</h1></header>
    <section class="pulse-stats org-stats" aria-label="At a glance">
      <div><strong>${members}<small>/${org.invited}</small></strong><span>invited people now in a Circle</span></div>
      <div><strong>${org.trend[org.trend.length - 1]}%</strong><span>checked in this week</span></div>
      <div><strong>${avg(a.map((c) => c.attendance))}%</strong><span>average meeting attendance</span></div>
      <div><strong>${cs.length}</strong><span>Circles across ${org.programs.length} programs</span></div>
    </section>
    <div class="org-two">
      <section class="card" aria-labelledby="tr-h"><div class="card-head"><h2 id="tr-h">Weekly participation</h2><span class="muted">Share of members who checked in</span></div>${trendChart(org.trend)}</section>
      <section class="card" aria-labelledby="na-h"><div class="card-head"><h2 id="na-h">Needs attention</h2></div>
        ${attention.length ? html`<ul class="todo-list">${attention.map((t) => html`<li><span class="todo-icon">${icon(t.icon, { size: 16 })}</span><span><strong>${t.title}</strong><small>${t.body}</small></span><button class="btn btn-sm btn-soft" data-action="${t.action}" data-id="${t.id}">${t.cta}</button></li>`)}</ul>` : html`<p class="muted">Everything’s running smoothly.</p>`}
      </section>
    </div>
    <section aria-labelledby="pg-h"><div class="sec-head"><h2 id="pg-h">Programs</h2><a class="btn btn-sm btn-outline" href="#/org/new-program">${icon('plus', { size: 14 })}New program</a></div>
      <div class="prog-grid">${org.programs.map(programCard)}</div></section>
    ${privacyNote()}`;
}

function programCard(p) {
  const g = GOALS[p.goal];
  const cs = progCircles(p.id);
  const a = active(cs);
  return html`<a class="prog" href="#/org/programs/${p.id}" style="--g:${g.hue};--g-soft:${g.soft};--g-deep:${g.deep}">
    <span class="prog-top">${goalTag(p.goal)}<span class="muted">${p.weeks ? (p.week ? `Week ${p.week} of ${p.weeks}` : `${p.weeks} weeks · starts soon`) : p.status}</span></span>
    <strong>${p.name}</strong><span class="prog-blurb">${p.blurb}</span>
    <span class="prog-nums"><span><b>${cs.length}</b> Circles</span><span><b>${cs.reduce((n, c) => n + c.members, 0)}</b> people</span><span><b>${avg(a.map((c) => c.engagement))}%</b> check in weekly</span></span>
    ${p.weeks ? progressBar(p.week, p.weeks, { tone: 'goal', label: 'Program progress' }) : ''}
  </a>`;
}

function programsPage(id) {
  const org = o();
  if (!id) return html`<header class="page-head"><h1>Programs</h1><p class="muted">A program is a goal, a length and a set of Circles. Members join a Circle; you see how the program is going.</p></header>
    <div class="prog-grid">${org.programs.map(programCard)}</div>
    <a class="new-prog" href="#/org/new-program">${icon('plus', { size: 18 })}<span><strong>New program</strong><small>Sleep, running, strength, stress and more. Set up in a few minutes.</small></span></a>`;
  const p = org.programs.find((x) => x.id === id);
  if (!p) { go('/org/programs'); return ''; }
  const g = GOALS[p.goal];
  const cs = progCircles(p.id);
  const unplaced = org.unplaced.filter((u) => inProg(u, p.id));
  return html`
    <a class="back" href="#/org/programs">${icon('arrowLeft', { size: 16 })}Programs</a>
    <header class="page-head prog-head" style="--g:${g.hue};--g-soft:${g.soft};--g-deep:${g.deep}">
      ${goalTag(p.goal)}<h1>${p.name}</h1><p>${p.blurb}</p>
      <p class="muted">${p.weeks ? (p.week ? `Week ${p.week} of ${p.weeks}` : `${p.weeks} weeks · sign-ups open`) : 'Runs year-round'} · Plus included for every member · Circles of up to 7</p>
      <div class="hero-actions"><button class="btn btn-sm btn-primary" data-action="openOrgInvite" data-id="${p.id}">${icon('mail', { size: 14 })}Invite people</button><button class="btn btn-sm btn-outline" data-action="addOrgCircle" data-id="${p.id}">${icon('plus', { size: 14 })}Add a Circle</button></div>
    </header>
    ${unplaced.length ? html`<section class="card form-circles">
      <div class="card-head"><h2>${unplaced.length} people waiting for a Circle</h2></div>
      <p class="muted">Grouped by when they said they’re free. Each new Circle needs a leader; volunteers are suggested.</p>
      <div class="fc-groups">${['Mornings', 'Lunch'].map((t) => { const grp = unplaced.filter((u) => u.times === t); return grp.length ? html`<div class="fc-group"><strong>${t} group</strong><span class="muted">${grp.length} people</span><ul>${grp.map((u) => html`<li>${u.name}<small>${u.team}</small></li>`)}</ul></div>` : ''; })}</div>
      <button class="btn btn-primary" data-action="formCircles" data-id="${p.id}">${icon('sparkles', { size: 15 })}Form these Circles</button>
    </section>` : ''}
    <section class="card"><div class="card-head"><h2>Circles</h2><span class="muted">${cs.length}</span></div>${cs.length ? circlesTable(cs) : html`<p class="muted">No Circles yet. Invite people and we’ll group them as they sign up.</p>`}</section>
    ${privacyNote()}`;
}

function circlesPage() {
  return html`<header class="page-head"><h1>All Circles</h1><p class="muted">Every Circle across ${o().name}’s programs.</p></header>
    <section class="card">${circlesTable(o().circles)}</section>${privacyNote()}`;
}

function peoplePage() {
  const org = o();
  return html`<header class="page-head"><h1>People & leaders</h1><p class="muted">Leaders make Circles work. Every leader gets free training and a coach.</p></header>
    <section class="card"><div class="card-head"><h2>Leaders</h2><span class="muted">${org.leaders.length}</span></div>
      <ul class="leader-list">${org.leaders.map((l, i) => html`<li><span class="av av-sm" style="--tint:#D7D3F5">${l.name.split(' ').map((x) => x[0]).join('')}</span><span><strong>${l.name}</strong><small>${l.team} · leading since ${l.since}</small></span>${l.trained ? html`<span class="status st-good">Trained</span>` : html`<button class="btn btn-sm btn-outline" data-action="sendTraining" data-i="${i}">Send training</button>`}</li>`)}</ul></section>
    <section class="card"><div class="card-head"><h2>Volunteered to lead</h2></div>
      ${org.volunteers.length ? html`<ul class="leader-list">${org.volunteers.map((v, i) => html`<li><span class="av av-sm" style="--tint:#F6DFA9">${v.name.split(' ').map((x) => x[0]).join('')}</span><span><strong>${v.name}</strong><small>${v.team} · ${v.note}</small></span><button class="btn btn-sm btn-primary" data-action="assignVolunteer" data-i="${i}">Make a leader</button></li>`)}</ul>` : html`<p class="muted">No one waiting. Ask in your next all-hands; past members make great leaders.</p>`}
    </section>
    <section class="card"><div class="card-head"><h2>Invite people</h2><span class="muted">${org.invited} invited so far</span></div>
      <form class="invite-form" data-submit="orgInvite"><textarea name="emails" rows="3" placeholder="Paste emails, one per line" aria-label="Emails"></textarea><button class="btn btn-primary btn-sm" type="submit">Send invites</button></form>
      <p class="muted small">Anyone with an @${org.domain} email can also join from the invite page; they’ll pick a program and be placed in a Circle.</p>
    </section>`;
}

function settingsPage() {
  const org = o();
  const monthly = org.seatsPurchased * org.pricePerSeat;
  return html`<header class="page-head"><h1>Settings</h1></header>
    <form class="card" data-submit="saveOrg"><div class="card-head"><h2>Organization</h2></div>
      <label class="field"><span class="field-label">Name</span><input name="name" value="${org.name}"/></label>
      <label class="toggle-row"><input type="checkbox" name="autoJoin" ${org.autoJoin ? 'checked' : ''}/><span><strong>Let anyone @${org.domain} join</strong><small>People sign in with work email and choose a program.</small></span></label>
      <label class="toggle-row"><input type="checkbox" name="sponsoredPlus" ${org.sponsoredPlus ? 'checked' : ''}/><span><strong>Sponsor Circles Plus for members</strong><small>Workshops, experts and coaching included. Members never see a paywall.</small></span></label>
      <div class="row-end"><button class="btn btn-sm btn-primary" type="submit">Save</button></div>
    </form>
    <section class="card"><div class="card-head"><h2>Plan</h2></div>
      <div class="mem-rows"><div><span class="muted">Seats</span><strong>${org.seatsPurchased}</strong></div><div><span class="muted">Price</span><strong>$${org.pricePerSeat} per seat / month</strong></div><div><span class="muted">Monthly</span><strong>$${monthly.toLocaleString()}</strong></div></div>
      <p class="muted small">Includes Plus for every member, leader training and coaching, and program reporting. Unused seats roll over.</p>
      <button class="btn btn-sm btn-outline" data-action="addSeats">${icon('plus', { size: 14 })}Add 20 seats</button>
    </section>
    <section class="card"><div class="card-head"><h2>Data & privacy</h2></div>
      <ul class="plain-list privacy-list">
        <li>${icon('shield', { size: 15 })}Reports show totals for groups of five or more. Never individuals.</li>
        <li>${icon('lock', { size: 15 })}Goals, check-ins and conversations belong to members and their Circle.</li>
        <li>${icon('eye', { size: 15 })}Members can see exactly what you see, from their settings.</li>
      </ul>
    </section>`;
}

function newProgramPage() {
  const s = S();
  const d = (s.np = s.np || { name: '', goal: 'sleep', weeks: 6, who: 'Everyone at Harbourline', sponsor: true });
  const g = GOALS[d.goal];
  return html`<a class="back" href="#/org/programs">${icon('arrowLeft', { size: 16 })}Programs</a>
    <header class="page-head"><h1>New program</h1><p class="muted">Pick a goal and a length. We’ll handle sign-ups, matching people into Circles, and leader training.</p></header>
    <form class="card wizard" data-submit="createProgram" style="--g:${g.hue};--g-soft:${g.soft};--g-deep:${g.deep}">
      <fieldset class="field"><legend class="field-label">Goal</legend>
        <div class="goal-pick goal-pick-sm">${GOAL_LIST.map((x) => html`<button type="button" class="${cx('goal-opt', d.goal === x.id && 'on')}" aria-pressed="${d.goal === x.id}" style="--g:${x.hue};--g-soft:${x.soft};--g-deep:${x.deep}" data-action="npSet" data-key="goal" data-value="${x.id}"><span class="goal-opt-icon">${icon(x.icon, { size: 20 })}</span><strong>${x.name}</strong></button>`)}</div>
      </fieldset>
      <label class="field"><span class="field-label">Program name</span><input name="name" data-bind="np.name" value="${d.name}" placeholder="e.g. ${g.short} Circles, spring cohort" required/></label>
      <div class="form-grid">
        <label class="field"><span class="field-label">Length</span><select name="weeks">${[4, 6, 8, 10, 0].map((w) => html`<option value="${w}" ${d.weeks === w ? 'selected' : ''}>${w ? `${w} weeks` : 'Ongoing'}</option>`)}</select></label>
        <label class="field"><span class="field-label">Who can join</span><select name="who"><option>Everyone at ${o().name}</option><option>Specific teams</option><option>Invite only</option></select></label>
      </div>
      <label class="toggle-row"><input type="checkbox" name="sponsor" checked/><span><strong>Include Circles Plus</strong><small>Members get ${g.short.toLowerCase()} workshops, experts and coaching.</small></span></label>
      <div class="row-end"><button class="btn btn-primary" type="submit">${icon('send', { size: 15 })}Launch and open sign-ups</button></div>
    </form>`;
}

export function orgPage(section, id) {
  if (section === 'programs') return programsPage(id);
  if (section === 'circles') return circlesPage();
  if (section === 'people') return peoplePage();
  if (section === 'settings') return settingsPage();
  if (section === 'new-program') return newProgramPage();
  return overview();
}

const NAMES = ['Ella Wright', 'Marcus Lee', 'Priyanka Das', 'Tom Hughes', 'Yuki Sato', 'Carmen Ortiz', 'Ben Fraser', 'Aisha Khan', 'Liam Walsh', 'Nora Berg', 'Sam Okoye', 'Ruby Chen'];

export const orgActions = {
  navOrg(el) { go(`/org/programs/${el.dataset.id}`); },
  assignLeader(el) { openModal('assignLeader', { id: el.dataset.id }); },
  confirmAssign(form, fd) {
    const name = fd.get('leader');
    set((s) => {
      const c = s.org.circles.find((x) => x.id === form.dataset.id);
      c.leader = name; c.flag = null; c.engagement = c.engagement || 0;
      s.org.volunteers = s.org.volunteers.filter((v) => v.name !== name);
      if (!s.org.leaders.find((l) => l.name === name)) s.org.leaders.push({ name, team: 'Volunteer', trained: false, circles: 1, since: 'Now' });
      s.ui.modal = null;
    });
    toast(`${name} is leading. Training and a coach call are on their way.`);
  },
  offerCoaching(el) {
    set((s) => { const c = s.org.circles.find((x) => x.id === el.dataset.id); c.flag = null; c.coached = true; });
    toast('Coaching offered. The leader can book a time that suits them.');
  },
  formCircles(el) {
    set((s) => {
      const org = s.org;
      const pid = el.dataset.id || 'pr_run';
      const p = org.programs.find((x) => x.id === pid);
      ['Mornings', 'Lunch'].forEach((t) => {
        const grp = org.unplaced.filter((u) => inProg(u, pid) && u.times === t);
        if (!grp.length) return;
        org.circles.push({ id: uid('oc'), programId: pid, name: `${p.name.split(' ')[0]} ${p.name.split(' ')[1] || ''} · ${t}`.replace(/\s+/g, ' '), leader: null, members: grp.length, size: 7, engagement: 0, attendance: 0, flag: 'Needs a leader' });
      });
      org.unplaced = org.unplaced.filter((u) => !inProg(u, pid));
    }, { render: false });
    toast('Circles formed. Next: give each one a leader.');
    go(`/org/programs/${el.dataset.id || 'pr_run'}`);
  },
  sendTraining(el) { set((s) => { s.org.leaders[Number(el.dataset.i)].trained = 'sent'; }); toast('Training sent'); },
  assignVolunteer(el) {
    const v = S().org.volunteers[Number(el.dataset.i)];
    const needs = S().org.circles.find((c) => !c.leader);
    if (!needs) { toast('No Circles need a leader right now'); return; }
    openModal('assignLeader', { id: needs.id, preselect: v.name });
  },
  orgInvite(form, fd) {
    const n = (fd.get('emails') || '').toString().split(/[\s,]+/).filter((e) => e.includes('@')).length;
    if (!n) { toast('Add at least one email'); return; }
    set((s) => { s.org.invited += n; });
    toast(`${n} invite${n === 1 ? '' : 's'} sent`);
  },
  openOrgInvite() { go('/org/people'); },
  addOrgCircle(el) {
    set((s) => { const p = s.org.programs.find((x) => x.id === el.dataset.id); s.org.circles.push({ id: uid('oc'), programId: p.id, name: `${p.name} · New Circle`, leader: null, members: 0, size: 7, engagement: 0, attendance: 0, flag: 'Needs a leader' }); });
    toast('Circle added. Assign a leader and invite people.');
  },
  saveOrg(form, fd) { set((s) => { s.org.name = fd.get('name'); s.org.autoJoin = !!fd.get('autoJoin'); s.org.sponsoredPlus = !!fd.get('sponsoredPlus'); }); toast('Saved'); },
  addSeats() { set((s) => { s.org.seatsPurchased += 20; }); toast('20 seats added'); },
  npSet(el) { set((s) => { s.np = s.np || {}; s.np[el.dataset.key] = el.dataset.value; }); },
  createProgram(form, fd) {
    const s = S();
    const d = s.np || {};
    const name = (fd.get('name') || '').toString().trim() || `${GOALS[d.goal || 'sleep'].short} Circles`;
    const id = uid('pr');
    const goal = d.goal || 'sleep';
    set((st) => {
      st.org.programs.push({ id, name, goal, weeks: Number(fd.get('weeks')), week: 0, status: 'Sign-ups open', blurb: `${GOALS[goal].pitch}` });
      const signups = NAMES.slice(0, 12).map((n, i) => ({ name: n, team: ['Engineering', 'Sales', 'Operations', 'Finance'][i % 4], goal, programId: id, times: i % 2 ? 'Lunch' : 'Mornings' }));
      st.org.unplaced = [...st.org.unplaced, ...signups];
      st.org.invited += 12;
      delete st.np;
    }, { render: false });
    toast('Program launched. 12 people signed up in the first hour.');
    go(`/org/programs/${id}`);
  },
};

void emptyState;
