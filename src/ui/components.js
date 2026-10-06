import { html, raw, cx, esc } from '../lib/html.js';
import { icon } from './icons.js';
import { markSVG } from './logo.js';
import { S, person, weekHits, meId, circleWeek, TARGET_PER_WEEK, isPlus } from '../store.js';
import { GOALS } from '../data/goals.js';
import { EXPERTS } from '../data/support.js';

export const logo = (size = 26, cls = '') => raw(markSVG({ size, className: cls }));

export function wordmark() {
  return html`<a class="wordmark" href="#/" aria-label="Circles home">${logo(26, 'wordmark-mark')}<span>Circles</span></a>`;
}

export function avatar(uidOrPerson, size = 'md', opts = {}) {
  const p = typeof uidOrPerson === 'string' ? person(uidOrPerson) : uidOrPerson;
  const tag = opts.action ? 'button' : 'span';
  const act = opts.action ? raw(` type="button" data-action="${opts.action}" data-id="${esc(p.id)}" aria-label="${esc(opts.label || p.name)}"`) : raw(` aria-hidden="${opts.label ? 'false' : 'true'}"`);
  return html`<${raw(tag)} class="${cx('av', `av-${size}`, opts.className)}" style="--tint:${p.tint}"${act} title="${p.name}">${p.initials}</${raw(tag)}>`;
}

export function expertAvatar(id, size = 'md') {
  const e = EXPERTS[id];
  return html`<span class="${cx('av', `av-${size}`, 'av-expert')}" style="--tint:${e.hue}" aria-hidden="true">${e.initials}</span>`;
}

export function avatarStack(ids, { max = 5, size = 'sm' } = {}) {
  const shown = ids.slice(0, max);
  const more = ids.length - shown.length;
  return html`<span class="av-stack">${shown.map((id) => avatar(id, size))}${more > 0 ? html`<span class="${cx('av', `av-${size}`, 'av-more')}">+${more}</span>` : ''}</span>`;
}

export function goalTag(goalId, { solid = false } = {}) {
  const g = GOALS[goalId];
  return html`<span class="${cx('goal-tag', solid && 'is-solid')}" style="--g:${g.hue};--g-soft:${g.soft};--g-deep:${g.deep}">${icon(g.icon, { size: 14 })}${g.name}</span>`;
}

export const plusTag = (label = 'Plus') => html`<span class="plus-tag">${icon('sparkles', { size: 12 })}${label}</span>`;

export function progressBar(value, max, { tone = 'teal', label } = {}) {
  const pct = Math.max(0, Math.min(100, (value / Math.max(max, 1)) * 100));
  return html`<div class="${cx('bar', `bar-${tone}`)}" role="progressbar" aria-valuenow="${value}" aria-valuemin="0" aria-valuemax="${max}" aria-label="${label || 'Progress'}"><span style="width:${pct}%"></span></div>`;
}

/** Seven small dots: filled = on target, ring = logged miss, faint = no log. */
export function dots(values, { size = 8 } = {}) {
  return html`<span class="dots" style="--d:${size}px">${values.map((v) => html`<i class="${v === true ? 'hit' : v === false ? 'miss' : ''}"></i>`)}</span>`;
}

export function seats(filled, size) {
  return html`<span class="seats" aria-label="${filled} of ${size} seats taken">${Array.from({ length: size }, (_, i) => html`<i class="${i < filled ? 'on' : ''}"></i>`)}</span>`;
}

/** Ring arc helper (SVG), value 0..1 */
function arc(r, value, cls) {
  const c = 2 * Math.PI * r;
  const v = Math.max(0, Math.min(1, value));
  return `<circle class="${cls}" r="${r}" cx="50" cy="50" fill="none" stroke-dasharray="${(c * v).toFixed(2)} ${c.toFixed(2)}" transform="rotate(-90 50 50)"/>`;
}

/**
 * The signature visual: the Circle as an actual circle. Members sit on the ring,
 * each with a small arc showing their week; the centre shows the shared goal.
 */
export function circleRing(c, { size = 'lg', interactive = true } = {}) {
  const g = GOALS[c.goal];
  const week = circleWeek(c);
  const n = Math.max(c.size, c.memberIds.length);
  const meIdNow = meId();
  const seatsHtml = [];
  for (let i = 0; i < n; i++) {
    const a = (-90 + (360 / n) * i) * (Math.PI / 180);
    const x = 50 + 41 * Math.cos(a);
    const y = 50 + 41 * Math.sin(a);
    const uid = c.memberIds[i];
    if (!uid) {
      seatsHtml.push(html`<span class="ring-seat is-open" style="left:${x}%;top:${y}%" title="Open seat"><span>${icon('plus', { size: 14 })}</span></span>`);
      continue;
    }
    const p = person(uid);
    const v = weekHits(uid, c.goal) / TARGET_PER_WEEK;
    const isMe = uid === meIdNow;
    seatsHtml.push(html`
      <button type="button" class="${cx('ring-seat', isMe && 'is-me')}" style="left:${x}%;top:${y}%" ${interactive ? raw(`data-action="openMember" data-id="${uid}"`) : raw('tabindex="-1"')} aria-label="${p.name}${uid === c.leaderId ? ', leader' : ''}: ${weekHits(uid, c.goal)} of ${TARGET_PER_WEEK} in the past 7 days">
        <svg class="seat-arc" viewBox="0 0 100 100" aria-hidden="true"><circle r="46" cx="50" cy="50" class="seat-track"/>${raw(arc(46, v, 'seat-fill'))}</svg>
        ${avatar(p, size === 'lg' ? 'ring' : 'md')}
        ${uid === c.leaderId ? html`<span class="seat-badge" title="Circle leader">${icon('star', { size: 10 })}</span>` : ''}
        <span class="seat-name">${isMe ? 'You' : p.first}</span>
      </button>`);
  }
  return html`
    <div class="${cx('ring', `ring-${size}`)}" style="--g:${g.hue};--g-soft:${g.soft}">
      <svg class="ring-svg" viewBox="0 0 100 100" aria-hidden="true">
        <circle r="41" cx="50" cy="50" class="ring-track"/>
        <circle r="29" cx="50" cy="50" class="ring-progress-track"/>
        ${raw(arc(29, week.hits / week.target, 'ring-progress'))}
      </svg>
      <div class="ring-center">
        <span class="ring-icon">${icon(g.icon, { size: 18 })}</span>
        <strong>${week.hits}<small>/${week.target}</small></strong>
        <span>${g.checkin.hitLabel}<br/>past 7 days</span>
      </div>
      ${seatsHtml}
    </div>`;
}

export function emptyState({ iconName = 'sparkles', title, body, action }) {
  return html`<div class="empty">${icon(iconName, { size: 22 })}<h3>${title}</h3><p>${body}</p>${action || ''}</div>`;
}

export function sectionHead(title, aside = '') {
  return html`<div class="sec-head"><h2>${title}</h2>${aside}</div>`;
}

export function plusLock({ title, body, cta = 'See what Plus includes' }) {
  return html`<div class="plus-lock">
    <div>${plusTag()}<h3>${title}</h3><p>${body}</p></div>
    <button class="btn btn-plus" data-action="openPlus">${cta}</button>
  </div>`;
}

export const isPlusNow = () => isPlus();

export function field({ label, name, value = '', type = 'text', placeholder = '', hint, required, rows, bind }) {
  const id = `f_${name}`;
  const common = raw(`id="${id}" name="${esc(name)}" placeholder="${esc(placeholder)}" ${required ? 'required' : ''} ${bind ? `data-bind="${esc(bind)}"` : ''}`);
  return html`<label class="field" for="${id}"><span class="field-label">${label}</span>
    ${rows ? html`<textarea ${common} rows="${rows}">${value}</textarea>` : html`<input ${common} type="${type}" value="${value}"/>`}
    ${hint ? html`<span class="field-hint">${hint}</span>` : ''}</label>`;
}

export function segmented(name, options, value, action) {
  return html`<div class="seg" role="radiogroup" aria-label="${name}">${options.map((o) => {
    const v = typeof o === 'string' ? o : o.v;
    const l = typeof o === 'string' ? o : o.label;
    return html`<button type="button" role="radio" aria-checked="${v === value}" class="${cx('seg-btn', v === value && 'on')}" data-action="${action}" data-value="${v}" data-name="${name}">${l}</button>`;
  })}</div>`;
}

