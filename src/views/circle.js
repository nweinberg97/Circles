import { html, cx } from '../lib/html.js';
import { icon } from '../ui/icons.js';
import { avatar, avatarStack, circleRing, progressBar, goalTag, sectionHead, emptyState } from '../ui/components.js';
import { S, set, toast, meId, me, myCircle, person, circle as getCircle, circleWeek, challengeDay, challengeCount, challengeDone, challengeTodayDone, nextMeeting, daysUntil, postsFor, uid, isLeaderOf, openModal, weekHits, TARGET_PER_WEEK } from '../store.js';
import { GOALS } from '../data/goals.js';
import { RESOURCES, byGoal } from '../data/support.js';
import { ago, dayName, fmtTime, fmtDate, relDay, addDays, key } from '../lib/dates.js';
import { meetingCard } from './today.js';
import { go } from '../lib/router.js';

const TYPE_META = {
  win: { label: 'Win', icon: 'award' },
  struggle: { label: 'Needs a hand', icon: 'hand' },
  question: { label: 'Who’s in?', icon: 'users' },
  checkin: { label: 'Check-in', icon: 'check' },
  announcement: { label: 'From the leader', icon: 'megaphone' },
  update: { label: 'Update', icon: 'message' },
};

const INTENTS = [
  { v: 'win', label: 'I did it', icon: 'award', placeholder: 'What did you pull off? Small counts.' },
  { v: 'struggle', label: 'Struggling today', icon: 'hand', placeholder: 'What’s getting in the way? Your Circle has been there.' },
  { v: 'question', label: 'Who’s in?', icon: 'users', placeholder: 'Walk, call, early night… what do you want company for?' },
  { v: 'update', label: 'Just an update', icon: 'message', placeholder: 'Share how your week is going.' },
];

function composer(c) {
  const s = S();
  const intent = INTENTS.find((i) => i.v === s.ui.composer) || INTENTS[0];
  const lead = isLeaderOf(c) && s.persona === 'leader';
  return html`<form class="card composer" data-submit="post" aria-label="Post to your Circle">
    <div class="composer-row">${avatar(me(), 'md')}
      <textarea name="text" rows="2" data-focus="composer" placeholder="${intent.placeholder}" aria-label="Message to your Circle"></textarea></div>
    <div class="composer-foot">
      <div class="intent-chips" role="radiogroup" aria-label="What kind of post">
        ${INTENTS.map((i) => html`<button type="button" role="radio" aria-checked="${i.v === intent.v}" class="${cx('intent', i.v === intent.v && 'on', `intent-${i.v}`)}" data-action="setIntent" data-value="${i.v}">${icon(i.icon, { size: 14 })}${i.label}</button>`)}
        ${lead ? html`<button type="button" role="radio" aria-checked="${s.ui.composer === 'announcement'}" class="${cx('intent', s.ui.composer === 'announcement' && 'on')}" data-action="setIntent" data-value="announcement">${icon('megaphone', { size: 14 })}Announcement</button>` : ''}
      </div>
      <button class="btn btn-primary btn-sm" type="submit">Post</button>
    </div>
  </form>`;
}

export function postCard(p, c) {
  const s = S();
  const mine = p.uid === meId();
  const author = person(p.uid);
  const meta = TYPE_META[p.type] || TYPE_META.update;
  const cheered = p.cheers.includes(meId());
  const metoo = p.metoo.includes(meId());
  const going = p.join?.going.includes(meId());
  return html`<article class="${cx('post', `post-${p.type}`, p.pinned && 'is-pinned')}" aria-label="${author.name}: ${meta.label}">
    <header class="post-head">
      ${avatar(author, 'md', { action: 'openMember', label: author.name })}
      <div><strong>${mine ? 'You' : author.name}</strong>${p.uid === c.leaderId ? html`<span class="tag">Leader</span>` : ''}
      <span class="post-meta"><span class="${cx('post-type', `pt-${p.type}`)}">${icon(meta.icon, { size: 12 })}${meta.label}</span>${ago(p.at)}${p.pinned ? html` · ${icon('pin2', { size: 12 })}Pinned` : ''}</span></div>
    </header>
    <p class="post-text">${p.text}</p>
    ${p.join ? html`<div class="post-join"><span>${icon('calendar', { size: 15 })}<strong>${p.join.label}</strong> · ${p.join.going.length} going</span>${avatarStack(p.join.going, { size: 'xs' })}<button class="${cx('btn btn-sm', going ? 'btn-soft on' : 'btn-outline')}" data-action="joinPost" data-id="${p.id}">${going ? html`${icon('check', { size: 14 })}You’re in` : 'I’m in'}</button></div>` : ''}
    <footer class="post-actions">
      ${!mine ? html`<button class="${cx('react', cheered && 'on')}" data-action="cheer" data-id="${p.id}" aria-pressed="${cheered}">${icon('heart', { size: 15 })}${cheered ? 'Cheered' : 'Cheer'}</button>` : ''}
      ${p.type === 'struggle' && !mine ? html`<button class="${cx('react', metoo && 'on')}" data-action="metoo" data-id="${p.id}" aria-pressed="${metoo}">${icon('users', { size: 15 })}Same here</button>` : ''}
      <button class="react" data-action="toggleReply" data-id="${p.id}">${icon('message', { size: 15 })}Reply</button>
      ${p.cheers.length || p.metoo.length ? html`<span class="react-who">${p.cheers.length ? html`${namesOf(p.cheers)} cheered` : ''}${p.cheers.length && p.metoo.length ? ' · ' : ''}${p.metoo.length ? html`${namesOf(p.metoo)} said same here` : ''}</span>` : ''}
    </footer>
    ${p.replies.length ? html`<ul class="replies">${p.replies.map((r) => html`<li>${avatar(r.uid, 'xs')}<p><strong>${r.uid === meId() ? 'You' : person(r.uid).first}</strong> ${r.text}<span class="muted"> · ${ago(r.at)}</span></p></li>`)}</ul>` : ''}
    ${s.ui.replyTo === p.id ? html`<form class="reply-form" data-submit="reply" data-id="${p.id}">${avatar(me(), 'xs')}<input name="text" data-focus="reply-${p.id}" placeholder="${p.type === 'struggle' ? 'Something kind or useful…' : 'Write a reply…'}" aria-label="Reply" autocomplete="off"/>
      <div class="quick-replies">${(p.type === 'win' ? ['Nice work!', 'So proud of you', 'Keep it going'] : p.type === 'struggle' ? ['Tonight counts', 'You’ve got this', 'Want to check in together tomorrow?'] : ['Count me in', 'Sounds good']).map((q) => html`<button type="button" class="chip" data-action="quickReply" data-id="${p.id}" data-value="${q}">${q}</button>`)}</div>
      <button class="btn btn-sm btn-primary" type="submit">Send</button></form>` : ''}
  </article>`;
}

function namesOf(ids) {
  const names = ids.map((i) => (i === meId() ? 'You' : person(i).first));
  if (names.length <= 2) return names.join(' and ');
  return `${names.slice(0, 2).join(', ')} and ${names.length - 2} more`;
}

function challengePanel(c) {
  const day = challengeDay(c);
  const doneToday = challengeTodayDone(c, meId());
  const lastNight = c.memberIds.filter((m) => challengeDone(c, m, day - 2)).length;
  const inChallenge = (S().challengeLog[c.id] || {})[meId()] !== undefined;
  return html`<section class="card challenge" aria-labelledby="ch-h">
    <div class="challenge-top">
      <span class="challenge-icon">${icon('flame', { size: 18 })}</span>
      <div><p class="muted">Group challenge · day ${day} of ${c.challenge.days}</p><h2 id="ch-h">${c.challenge.title}</h2><p>${c.challenge.action}</p></div>
    </div>
    <div class="challenge-days" aria-label="Challenge days">${Array.from({ length: c.challenge.days }, (_, i) => html`<span class="${cx(i < day - 1 && 'past', i === day - 1 && 'today')}"><b>${i + 1}</b>${i < day - 1 || (i === day - 1) ? avatarDots(c, i) : ''}</span>`)}</div>
    <div class="challenge-foot">
      <span>${day > 1 ? `${lastNight} of ${c.memberIds.length} did it last night` : 'Starts tonight'}</span>
      ${inChallenge ? html`<button class="${cx('btn btn-sm', doneToday ? 'btn-soft on' : 'btn-primary')}" data-action="challengeToday">${doneToday ? html`${icon('check', { size: 14 })}Done tonight` : 'I did it tonight'}</button>` : html`<button class="btn btn-sm btn-outline" data-action="joinChallenge">Join the challenge</button>`}
    </div>
  </section>`;
}
function avatarDots(c, i) {
  const n = c.memberIds.filter((m) => challengeDone(c, m, i)).length;
  return html`<i style="--p:${n / c.memberIds.length}"></i>`;
}

function winsCard(c) {
  const s = S();
  const wins = s.posts.filter((p) => p.circleId === c.id && (p.type === 'win' || p.type === 'checkin') && Date.now() - p.at < 7 * 86400000).slice(0, 4);
  return html`<section class="card wins" aria-labelledby="wins-h">
    <div class="card-head"><h2 id="wins-h">${icon('award', { size: 18 })}Wins this week</h2></div>
    ${wins.length ? html`<ul>${wins.map((w) => html`<li>${avatar(w.uid, 'xs')}<span><strong>${w.uid === meId() ? 'You' : person(w.uid).first}</strong> ${w.text.length > 80 ? w.text.slice(0, 78) + '…' : w.text}</span></li>`)}</ul>` : html`<p class="muted">The first win of the week is up for grabs.</p>`}
  </section>`;
}

function agreementsCard(c) {
  return html`<section class="card agreements" aria-labelledby="ag-h">
    <div class="card-head"><h2 id="ag-h">How we treat each other</h2></div>
    <ul>${c.agreements.map((a) => html`<li><strong class="${`val-${a.value.toLowerCase()}`}">${a.value}</strong><span>${a.line}</span></li>`)}</ul>
  </section>`;
}

function triedCard(c) {
  const list = byGoal(RESOURCES, c.goal).filter((r) => r.circleTried.some((u) => c.memberIds.includes(u)));
  if (!list.length) return '';
  return html`<section class="card tried" aria-labelledby="tr-h">
    <div class="card-head"><h2 id="tr-h">Tried in this Circle</h2><a class="link" href="#/support/resources">All</a></div>
    <ul>${list.slice(0, 3).map((r) => html`<li><button class="tried-item" data-action="openResource" data-id="${r.id}"><span><strong>${r.name}</strong><small>${r.type}</small></span>${avatarStack(r.circleTried.filter((u) => c.memberIds.includes(u)), { size: 'xs' })}</button></li>`)}</ul>
  </section>`;
}

export function circleHome(circleId) {
  const s = S();
  const c = (circleId && getCircle(circleId)) || myCircle();
  if (!c) return { main: emptyState({ iconName: 'circle', title: 'You’re not in a Circle yet', body: 'Circles are small groups of 5–7 people. Find one that fits your goal and schedule.', action: html`<a class="btn btn-primary" href="#/discover">Find a Circle</a>` }) };
  const g = GOALS[c.goal];
  const week = circleWeek(c);
  const leader = person(c.leaderId);
  const posts = postsFor(c.id);
  const lead = isLeaderOf(c) && s.persona === 'leader';
  const welcome = s.ui.welcome;
  const main = html`
    ${welcome ? html`<div class="welcome-banner" role="status">${icon('sparkles', { size: 18 })}<span><strong>You’re in.</strong> Your Circle just got the news. Say hi below, then check in tonight.</span><button class="icon-btn" data-action="dismissWelcome" aria-label="Dismiss">${icon('x', { size: 16 })}</button></div>` : ''}
    <header class="circle-hero" style="--g:${g.hue};--g-soft:${g.soft};--g-deep:${g.deep}">
      <div class="circle-hero-text">
        ${goalTag(c.goal)}
        <h1>${c.name}</h1>
        <p class="circle-shared">${icon('target', { size: 18 })}<span><span class="muted">Together:</span> ${c.sharedGoal}</span></p>
        <p class="circle-meta">${icon('calendar', { size: 15 })}${dayName(c.rhythm.dow)}s, ${fmtTime(c.rhythm.time)} ${icon('pin', { size: 15 })}${c.place} ${icon('star', { size: 15 })}Led by ${leader.first}</p>
        <div class="circle-week">
          <div><strong>${week.hits} of ${week.target}</strong> ${g.checkin.hitLabel} as a Circle in the past 7 days</div>
          ${progressBar(week.hits, week.target, { tone: 'goal', label: 'Circle progress, past 7 days' })}
          <p class="muted">Everyone aims for ${TARGET_PER_WEEK}. Tap anyone to see how their week is going.</p>
        </div>
        ${lead ? html`<div class="hero-actions"><a class="btn btn-sm btn-outline" href="#/lead">${icon('megaphone', { size: 15 })}Leader tools</a><button class="btn btn-sm btn-outline" data-action="openInvite">${icon('userPlus', { size: 15 })}Invite</button></div>` : html`<div class="hero-actions"><button class="btn btn-sm btn-outline" data-action="suggestFriend">${icon('userPlus', { size: 15 })}Suggest a friend</button></div>`}
      </div>
      ${circleRing(c)}
    </header>
    ${challengePanel(c)}
    ${composer(c)}
    <section aria-labelledby="conv-h" class="conversation">
      ${sectionHead('Conversation', html`<span class="muted">${c.memberIds.length} people · only your Circle can see this</span>`)}
      <h2 id="conv-h" class="sr-only">Conversation</h2>
      ${posts.map((p) => postCard(p, c))}
      <p class="feed-end">${icon('circle', { size: 16 })}You’re all caught up. That’s the whole week.</p>
    </section>`;
  const rail = html`${meetingCard(c, { compact: true })}${winsCard(c)}${triedCard(c)}${agreementsCard(c)}`;
  return { main, rail };
}

// ---------- Meeting ----------
function ics(c) {
  const d = nextMeeting(c);
  const end = new Date(d.getTime() + c.rhythm.mins * 60000);
  const f = (x) => x.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  const body = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Circles//EN', 'BEGIN:VEVENT', `UID:${c.id}-${f(d)}@circles.app`, `DTSTAMP:${f(new Date())}`, `DTSTART:${f(d)}`, `DTEND:${f(end)}`, `RRULE:FREQ=WEEKLY`, `SUMMARY:${c.name} — weekly Circle`, `LOCATION:${[c.rhythm.venue, c.rhythm.address].filter(Boolean).join(', ') || c.rhythm.link}`, `DESCRIPTION:${c.agenda.map((a, i) => `${i + 1}. ${a.title}`).join('\\n')}\\nVideo: https://${c.rhythm.link || 'circles.app'}`, 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
  return `data:text/calendar;charset=utf-8,${encodeURIComponent(body)}`;
}

export function meetingPage() {
  const s = S();
  const c = myCircle();
  const g = GOALS[c.goal];
  const d = nextMeeting(c);
  const going = c.memberIds.filter((m) => c.rsvp[m] === 'yes');
  const maybe = c.memberIds.filter((m) => c.rsvp[m] === 'maybe');
  const noReply = c.memberIds.filter((m) => !c.rsvp[m]);
  const last = c.pastMeetings[0];
  const lead = isLeaderOf(c) && s.persona === 'leader';
  const mine = last?.commitments.find((x) => x.uid === meId());
  const total = c.agenda.reduce((n, a) => n + a.mins, 0);
  const mapQ = encodeURIComponent([c.rhythm.venue, c.rhythm.address].filter(Boolean).join(', '));
  let t = 0;
  const main = html`
    <a class="back" href="#/circle">${icon('arrowLeft', { size: 16 })}${c.name}</a>
    <header class="page-head">
      <p class="muted">${relDay(d)} · ${fmtDate(d, { weekday: false })} · ${fmtTime(c.rhythm.time)}–${fmtTime(`${String(new Date(d.getTime() + c.rhythm.mins * 60000).getHours()).padStart(2, '0')}:${String(new Date(d.getTime() + c.rhythm.mins * 60000).getMinutes()).padStart(2, '0')}`)}</p>
      <h1>Weekly Circle</h1>
      <div class="meet-places">
        ${c.rhythm.venue ? html`<a class="place" href="https://maps.google.com/?q=${mapQ}" target="_blank" rel="noopener">${icon('pin', { size: 18 })}<span><strong>${c.rhythm.venue}</strong><small>${c.rhythm.address || ''}</small></span>${icon('external', { size: 14 })}</a>` : ''}
        ${c.rhythm.link ? html`<button class="place" data-action="joinVideo">${icon('video', { size: 18 })}<span><strong>Join on video</strong><small>${c.rhythm.link}</small></span></button>` : ''}
      </div>
      <div class="meet-head-actions">
        <a class="btn btn-sm btn-outline" href="${ics(c)}" download="circles-weekly.ics">${icon('calendar', { size: 15 })}Add to calendar</a>
        ${lead ? html`<button class="btn btn-sm btn-primary" data-action="startMeeting">${icon('play', { size: 15 })}Run this meeting</button><a class="btn btn-sm btn-outline" href="#/lead/rhythm">${icon('edit', { size: 15 })}Edit agenda</a>` : ''}
      </div>
    </header>

    <section class="card" aria-labelledby="ag-h">
      <div class="card-head"><h2 id="ag-h">Agenda</h2><span class="muted">${total} minutes</span></div>
      <ol class="agenda">${c.agenda.map((a) => { const start = t; t += a.mins; return html`<li><span class="agenda-t">${start}′</span><span class="agenda-title">${a.title}</span><span class="muted">${a.mins} min</span></li>`; })}</ol>
    </section>

    ${last ? html`<section class="card" aria-labelledby="last-h">
      <div class="card-head"><h2 id="last-h">From last week</h2><span class="muted">${fmtDate(addDays(new Date(), -last.daysAgo))} · ${last.attended.length} came</span></div>
      <p class="meeting-notes">${last.notes}</p>
      ${last.commitments.length ? html`<h3 class="h3">Commitments</h3>
      <ul class="commit-list">${last.commitments.map((cm) => html`<li class="${cx(cm.done && 'done')}">${avatar(cm.uid, 'xs')}<span><strong>${cm.uid === meId() ? 'You' : person(cm.uid).first}</strong> ${cm.text}</span>${cm.uid === meId() ? html`<button class="${cx('btn btn-sm', cm.done ? 'btn-soft on' : 'btn-outline')}" data-action="toggleCommit" data-uid="${cm.uid}">${cm.done ? html`${icon('check', { size: 14 })}Kept it` : 'Mark as kept'}</button>` : cm.done ? html`<span class="tag tag-ok">Kept</span>` : ''}</li>`)}</ul>` : ''}
      ${mine ? html`<p class="muted">You’ll be asked about this on Sunday. No pressure — just honesty.</p>` : ''}
    </section>` : ''}`;
  const rail = html`
    <section class="card"><div class="card-head"><h2>Are you coming?</h2></div>
      <div class="meet-rsvp">${['yes', 'maybe', 'no'].map((v) => html`<button type="button" class="${cx('rsvp', c.rsvp[meId()] === v && 'on')}" aria-pressed="${c.rsvp[meId()] === v}" data-action="rsvp" data-value="${v}" data-circle="${c.id}">${{ yes: 'Going', maybe: 'Maybe', no: 'Can’t go' }[v]}</button>`)}</div>
    </section>
    <section class="card"><div class="card-head"><h2>Who’s coming</h2></div>
      <ul class="rsvp-list">
        ${going.map((m) => html`<li>${avatar(m, 'xs')}${m === meId() ? 'You' : person(m).first}<span class="tag tag-ok">Going</span></li>`)}
        ${maybe.map((m) => html`<li>${avatar(m, 'xs')}${m === meId() ? 'You' : person(m).first}<span class="tag">Maybe</span></li>`)}
        ${noReply.map((m) => html`<li class="muted">${avatar(m, 'xs')}${m === meId() ? 'You' : person(m).first}<span class="tag tag-faint">No reply</span></li>`)}
      </ul>
      ${lead && noReply.length ? html`<button class="btn btn-sm btn-soft wide" data-action="remindRsvp">${icon('bell', { size: 14 })}Nudge ${noReply.length} who haven’t replied</button>` : ''}
    </section>`;
  void g; void key;
  return { main, rail };
}

export const circleActions = {
  setIntent(el) { set((s) => { s.ui.composer = el.dataset.value; }); setTimeout(() => document.querySelector('[data-focus="composer"]')?.focus(), 0); },
  post(form, fd) {
    const text = (fd.get('text') || '').toString().trim();
    const s = S();
    const intent = s.ui.composer || 'win';
    if (!text && intent !== 'win') { toast('Write a few words first'); return; }
    const c = myCircle();
    set((st) => {
      const post = { id: uid('p'), circleId: c.id, uid: meId(), type: intent, at: Date.now(), text: text || 'I did it today.', cheers: [], metoo: [], replies: [] };
      if (intent === 'question') post.join = { label: text.length > 40 ? 'Join in' : text, going: [meId()] };
      if (intent === 'announcement') post.pinned = true;
      st.posts.unshift(post);
      st.people[meId()].lastActive = Date.now();
      st.ui.composer = 'win';
    });
    toast(intent === 'struggle' ? 'Posted. Your Circle will see it.' : 'Posted to your Circle');
    // A little life: someone reacts shortly after.
    const others = c.memberIds.filter((m) => m !== meId() && m !== 'u_taylor');
    setTimeout(() => {
      set((st) => {
        const p = st.posts.find((x) => x.uid === meId() && Date.now() - x.at < 10000);
        if (!p) return;
        const who = others[Math.floor(Math.random() * others.length)];
        if (intent === 'struggle') p.replies.push({ id: uid('r'), uid: who, at: Date.now(), text: 'Been there this week too. Tonight’s a fresh start — check in with me tomorrow?' });
        else if (!p.cheers.includes(who)) p.cheers.push(who);
      });
    }, 2600);
  },
  toggleReply(el) {
    set((s) => { s.ui.replyTo = s.ui.replyTo === el.dataset.id ? null : el.dataset.id; });
    setTimeout(() => document.querySelector(`[data-focus="reply-${el.dataset.id}"]`)?.focus(), 0);
  },
  reply(form, fd) {
    const text = (fd.get('text') || '').toString().trim();
    if (!text) return;
    set((s) => { s.posts.find((p) => p.id === form.dataset.id).replies.push({ id: uid('r'), uid: meId(), at: Date.now(), text }); s.ui.replyTo = null; });
  },
  quickReply(el) {
    set((s) => { s.posts.find((p) => p.id === el.dataset.id).replies.push({ id: uid('r'), uid: meId(), at: Date.now(), text: el.dataset.value }); s.ui.replyTo = null; });
  },
  metoo(el) {
    set((s) => { const p = s.posts.find((x) => x.id === el.dataset.id); const i = p.metoo.indexOf(meId()); if (i >= 0) p.metoo.splice(i, 1); else p.metoo.push(meId()); });
  },
  joinPost(el) {
    set((s) => { const p = s.posts.find((x) => x.id === el.dataset.id); const i = p.join.going.indexOf(meId()); if (i >= 0) p.join.going.splice(i, 1); else p.join.going.push(meId()); });
  },
  challengeToday() {
    const c = myCircle();
    set((s) => {
      const log = (s.challengeLog[c.id][meId()] = s.challengeLog[c.id][meId()] || []);
      const i = challengeDay(c) - 1;
      log[i] = !log[i];
      const h = (s.habits[meId()] || []).find((x) => x.challenge);
      if (h) { s.habitLog[meId()] = s.habitLog[meId()] || {}; const t = (s.habitLog[meId()][key()] = s.habitLog[meId()][key()] || {}); t[h.id] = log[i]; }
    });
  },
  joinChallenge() {
    const c = myCircle();
    set((s) => {
      s.challengeLog[c.id][meId()] = Array(challengeDay(c) - 1).fill(false);
      s.habits[meId()].unshift({ id: 'challenge', title: c.challenge.title.replace(/^\d+-Day /, ''), detail: c.challenge.action, challenge: true });
    });
    toast('You’re in. Tonight is day one for you.');
  },
  dismissWelcome() { set((s) => { s.ui.welcome = false; }); },
  toggleCommit(el) {
    const c = myCircle();
    set(() => { const cm = c.pastMeetings[0].commitments.find((x) => x.uid === el.dataset.uid); cm.done = !cm.done; });
  },
  joinVideo() { toast('In the real app this opens the video call'); },
  suggestFriend() { openModal('suggest'); },
  startMeeting() { openModal('runMeeting', { step: 0 }); },
  remindRsvp() { toast('Reminder sent to everyone who hasn’t replied'); },
  openInvite() { openModal('invite'); },
  openResource(el) { openModal('resource', { id: el.dataset.id }); },
};

void weekHits; void challengeCount; void daysUntil; void go;
