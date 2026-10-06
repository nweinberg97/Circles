import { html, cx } from '../lib/html.js';
import { icon } from '../ui/icons.js';
import { avatar, plusTag, goalTag } from '../ui/components.js';
import { S, set, toast, meId, me, myCircle, myGoal, isPlus, openModal, weekHits, streak } from '../store.js';
import { GOALS } from '../data/goals.js';
import { fmtDate, addDays } from '../lib/dates.js';

export function membershipCard() {
  const s = S();
  const pl = s.plus[meId()] || { status: 'free' };
  if (pl.status !== 'plus') {
    return html`<section class="card member-card" aria-labelledby="mem-h">
      <div class="card-head"><h2 id="mem-h">Membership</h2><span class="tag">Free</span></div>
      <p>You have the whole Circle: the people, the meetings, challenges and starter guides. That’s free, for good.</p>
      <div class="mem-compare">
        <div><strong>With Plus you’d also get</strong>
        <ul>
          <li>${icon('video', { size: 15 })}Weekly live workshops with experts</li>
          <li>${icon('book', { size: 15 })}The full program library for your goal</li>
          <li>${icon('message', { size: 15 })}Ask an expert, answered within a day</li>
          <li>${icon('phone', { size: 15 })}A 15-minute coaching call each month</li>
          <li>${icon('star', { size: 15 })}Member perks from vetted partners</li>
        </ul></div>
      </div>
      <button class="btn btn-plus" data-action="openPlus">${icon('sparkles', { size: 15 })}Try Plus: $5/month or $50/year</button>
    </section>`;
  }
  const renew = addDays(new Date(), pl.plan === 'yearly' ? 214 : 21);
  return html`<section class="card member-card is-plus" aria-labelledby="mem-h">
    <div class="card-head"><h2 id="mem-h">Membership</h2>${plusTag('Circles Plus')}</div>
    <div class="mem-rows">
      <div><span class="muted">Plan</span><strong>${pl.plan === 'yearly' ? '$50 / year' : '$5 / month'}</strong></div>
      <div><span class="muted">Renews</span><strong>${fmtDate(renew, { weekday: false })}</strong></div>
      <div><span class="muted">Member since</span><strong>${pl.since || 'Today'}</strong></div>
    </div>
    <div class="mem-actions">
      ${pl.plan === 'monthly' ? html`<button class="btn btn-sm btn-outline" data-action="switchPlan" data-value="yearly">Switch to yearly and save $10</button>` : html`<button class="btn btn-sm btn-outline" data-action="switchPlan" data-value="monthly">Switch to monthly</button>`}
      <button class="btn btn-sm btn-outline" data-action="receipts">${icon('card', { size: 14 })}Receipts</button>
      <button class="btn btn-sm btn-link danger" data-action="cancelPlus">Cancel Plus</button>
    </div>
    <p class="muted small">Cancelling keeps your Circle exactly as it is. You’d only lose the extra support.</p>
  </section>`;
}

export function youPage() {
  const s = S();
  const p = me();
  const g = myGoal();
  const c = myCircle();
  const gg = GOALS[g?.goal || 'sleep'];
  const prefs = s.prefs?.[meId()] || { remind: true, meet: true, digest: true, weekly: false };
  const toggle = (k, label, sub) => html`<label class="toggle-row"><input type="checkbox" ${prefs[k] ? 'checked' : ''} data-change="setPref" data-key="${k}"/><span><strong>${label}</strong><small>${sub}</small></span></label>`;
  const main = html`
    <header class="profile-head">
      ${avatar(p, 'xl')}
      <div><h1>${p.name}</h1><p class="muted">${p.hood}${c ? ` · ${c.name}` : ''}</p><p>${p.bio || ''}</p></div>
    </header>
    ${g ? html`<section class="card"><div class="card-head"><h2>What I’m working on</h2><a class="link" href="#/goal">Edit</a></div>
      ${goalTag(g.goal)}<p class="profile-goal">${g.title}</p>${g.why ? html`<p class="muted">“${g.why}”</p>` : ''}
      <div class="stats stats-sm"><div class="stat"><strong>${weekHits(meId(), gg.id)}</strong><span>past 7 days</span></div><div class="stat"><strong>${streak(meId(), gg.id)}</strong><span>in a row</span></div></div>
    </section>` : ''}
    ${membershipCard()}
    <section class="card"><div class="card-head"><h2>Reminders</h2></div>
      ${toggle('remind', 'Evening check-in reminder', '9:30 PM, only if you haven’t checked in')}
      ${toggle('meet', 'Meeting reminders', 'The night before and an hour before')}
      ${toggle('digest', 'Circle digest', 'One summary a day instead of a ping for every post')}
      ${toggle('weekly', 'Weekly reflection', 'Sunday morning, before your meeting')}
    </section>
    <section class="card"><div class="card-head"><h2>Privacy</h2></div>
      <p class="privacy-line">${icon('shield', { size: 16 })}Your check-ins, habits and posts are visible to your Circle only. ${s.org ? 'If an organization sponsors your membership, it sees participation totals, never your details.' : ''}</p>
    </section>
    <section class="card"><div class="card-head"><h2>Help</h2></div>
      <div class="help-row"><button class="btn btn-sm btn-outline" data-action="emailSupport">${icon('mail', { size: 14 })}Email support, 24/7</button><button class="btn btn-sm btn-outline" data-action="demoMenu">${icon('refresh', { size: 14 })}Restart the demo</button></div>
    </section>`;
  return { main };
}

export const youActions = {
  switchPlan(el) { set((s) => { s.plus[meId()].plan = el.dataset.value; }); toast(el.dataset.value === 'yearly' ? 'Switched to yearly. You’ll save $10.' : 'Switched to monthly'); },
  cancelPlus() { openModal('cancelPlus'); },
  confirmCancel() { set((s) => { s.plus[meId()] = { status: 'free' }; s.ui.modal = null; }); toast('Plus cancelled. Your Circle is unchanged.'); },
  receipts() { toast('Receipts would download here'); },
  setPref(el) { set((s) => { s.prefs = s.prefs || {}; s.prefs[meId()] = { remind: true, meet: true, digest: true, weekly: false, ...(s.prefs[meId()] || {}), [el.dataset.key]: el.checked }; }, { render: false }); toast('Saved'); },
};

void cx; void isPlus;
