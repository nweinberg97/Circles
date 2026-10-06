// Single source of truth for the prototype. Plain object + mutation helpers,
// persisted to localStorage so a demo survives reloads.
import { createSeed } from './data/seed.js';
import { GOALS } from './data/goals.js';
import { key, daysAgo, weekDays, startOfDay, nextWeekday, DAY } from './lib/dates.js';

const STORAGE = 'circles-demo-v3';
let state;
let renderFn = () => {};

function load() {
  try {
    const s = JSON.parse(localStorage.getItem(STORAGE));
    if (s && s.version === 3) return s;
  } catch { /* storage unavailable */ }
  return null;
}
function save() {
  try { localStorage.setItem(STORAGE, JSON.stringify({ ...state, ui: { ...state.ui, modal: null, toast: null } })); } catch { /* ignore */ }
}

export function initStore(render) {
  renderFn = render;
  state = load() || createSeed();
}
export const S = () => state;

/** Mutate state then re-render. */
export function set(fn, { render = true } = {}) {
  fn(state);
  save();
  if (render) renderFn();
}

export function resetDemo({ fresh = false, persona = 'member' } = {}) {
  state = createSeed({ fresh });
  state.persona = persona;
  save();
}

let toastTimer;
export function toast(text, opts = {}) {
  state.ui.toast = { text, id: Math.random(), ...opts };
  renderFn();
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { state.ui.toast = null; renderFn(); }, opts.ms || 3200);
}
export function openModal(type, props = {}) { state.ui.modal = { type, ...props }; renderFn(); }
export function closeModal() { state.ui.modal = null; renderFn(); }

// ---------- Selectors ----------
export const meId = () => (state.persona === 'leader' ? state.me.leader : state.me.member);
export const me = () => state.people[meId()];
export const person = (id) => state.people[id] || { id, name: 'Someone', first: 'Someone', initials: '?', tint: '#ddd' };
export const circle = (id) => state.circles[id];
export const myCircle = () => circle(state.myCircle[meId()]);
export const myGoal = () => state.goals[meId()];
export const goalOf = (c) => GOALS[c?.goal || myGoal()?.goal || 'sleep'];
export const isPlus = (uid = meId()) => state.plus[uid]?.status === 'plus';
export const isLeaderOf = (c, uid = meId()) => c && c.leaderId === uid;

export function hitFor(goalId, v) {
  return !!GOALS[goalId].checkin.options.find((o) => o.v === v)?.hit;
}

const last7 = () => Array.from({ length: 7 }, (_, i) => daysAgo(i));
/** On-target count over the past 7 days (a rolling week, so Mondays aren't empty). */
export function weekHits(uid, goalId) {
  const log = state.checkins[uid] || {};
  return last7().reduce((n, d) => n + (hitFor(goalId, log[key(d)]) ? 1 : 0), 0);
}
export function weekLogged(uid) {
  const log = state.checkins[uid] || {};
  return last7().reduce((n, d) => n + (log[key(d)] ? 1 : 0), 0);
}
/** Hits for the last 7 days ending yesterday plus today */
export function recentDays(uid, n = 7) {
  const log = state.checkins[uid] || {};
  return Array.from({ length: n }, (_, i) => { const d = daysAgo(n - 1 - i); return { d, v: log[key(d)] }; });
}
export function streak(uid, goalId) {
  const log = state.checkins[uid] || {};
  let s = 0;
  for (let i = log[key()] ? 0 : 1; i < 60; i++) { if (hitFor(goalId, log[key(daysAgo(i))])) s++; else break; }
  return s;
}

export const TARGET_PER_WEEK = 5;

export function circleWeek(c) {
  const g = c.goal;
  const hits = c.memberIds.reduce((n, uid) => n + weekHits(uid, g), 0);
  return { hits, target: c.memberIds.length * TARGET_PER_WEEK };
}

export function challengeDay(c) {
  return Math.min(c.challenge.startedDaysAgo + 1, c.challenge.days);
}
export function challengeDone(c, uid, dayIdx) {
  return !!state.challengeLog[c.id]?.[uid]?.[dayIdx];
}
export function challengeTodayDone(c, uid) { return challengeDone(c, uid, challengeDay(c) - 1); }
export function challengeCount(c, uid) {
  return (state.challengeLog[c.id]?.[uid] || []).filter(Boolean).length;
}

export function nextMeeting(c) { return nextWeekday(c.rhythm.dow, c.rhythm.time); }
export function daysUntil(d) { return Math.round((startOfDay(d) - startOfDay()) / DAY); }

export function lastActiveDays(uid) {
  const p = person(uid);
  return Math.floor((Date.now() - (p.lastActive || Date.now())) / DAY);
}

export function postsFor(circleId) {
  return state.posts.filter((p) => p.circleId === circleId).sort((a, b) => (!!b.pinned - !!a.pinned) || b.at - a.at);
}

export function habitsDoneToday(uid) {
  return state.habitLog[uid]?.[key()] || {};
}
export function habitRate(uid, habitId, days = 14) {
  const log = state.habitLog[uid] || {};
  let n = 0;
  for (let i = 1; i <= days; i++) if (log[key(daysAgo(i))]?.[habitId]) n++;
  return n / days;
}

export const uid = (p = 'id') => `${p}_${Math.random().toString(36).slice(2, 8)}`;
