import { html } from '../lib/html.js';
import { icon } from '../ui/icons.js';
import { wordmark, logo, avatar, plusTag } from '../ui/components.js';
import { S, person } from '../store.js';
import { GOAL_LIST } from '../data/goals.js';

const NOTES = [
  { uid: 'u_priya', text: 'Lights out before 11, three nights running' },
  { uid: 'u_chris', text: 'Struggling today. 3 PM latte, wired till 1' },
  { uid: 'u_maya', text: 'Sunday 10 AM, coffee’s on me' },
  { uid: 'u_jordan', text: 'Slept 7h20. Woke before my alarm' },
];

function heroRing() {
  const ids = ['u_maya', 'u_priya', 'u_jordan', 'u_sam', 'u_taylor', 'u_chris', 'u_alex'];
  return html`<div class="hero-ring" aria-hidden="true">
    <div class="hero-orbit"></div>
    ${ids.map((id, i) => {
      const a = (-90 + (360 / 7) * i) * (Math.PI / 180);
      return html`<span class="hero-seat" style="left:${50 + 42 * Math.cos(a)}%;top:${50 + 42 * Math.sin(a)}%;--i:${i}">${avatar(id, 'lg')}</span>`;
    })}
    <div class="hero-core">${logo(64)}<span>Better Sleep<br/>Vancouver</span></div>
    ${NOTES.map((n, i) => html`<div class="hero-note hero-note-${i}" style="--i:${i}">${avatar(n.uid, 'xs')}<span><strong>${person(n.uid).first}</strong> ${n.text}</span></div>`)}
  </div>`;
}

export function landing() {
  const s = S();
  return html`
  <div class="landing">
    <header class="lp-nav">
      ${wordmark()}
      <nav aria-label="Sections"><a href="#how">How it works</a><a href="#plus">Membership</a><a href="#orgs">For organizations</a></nav>
      <button class="btn btn-ghost-light" data-action="startAs" data-value="member">Open the demo</button>
    </header>

    <section class="lp-hero">
      <div class="lp-hero-copy">
        <p class="lp-kicker">Invite-only · Vancouver pilot</p>
        <h1>Change is easier in a small circle.</h1>
        <p class="lp-lede">Circles puts you with 5–7 people working toward the same health goal. You meet every week, check in most days, and get expert help when you’re stuck.</p>
        <div class="lp-cta">
          <button class="btn btn-teal btn-lg" data-action="startAs" data-value="fresh">${icon('mail', { size: 18 })}Accept Maya’s invite</button>
          <button class="btn btn-ghost-light btn-lg" data-action="startAs" data-value="member">Step into a live Circle</button>
        </div>
        <p class="lp-fine">A working prototype. Everything is clickable and saves as you go.</p>
      </div>
      ${heroRing()}
    </section>

    <section class="lp-doors" aria-labelledby="doors-h">
      <h2 id="doors-h">See it from every side</h2>
      <p class="lp-sub">Circles works because three people want it to: the member doing the work, the leader holding the group together, and the organization that brings them in.</p>
      <div class="doors">
        <button class="door" data-action="startAs" data-value="fresh">
          <span class="door-icon">${icon('mail')}</span>
          <strong>New member</strong>
          <span>Accept an invitation, pick a goal, meet your Circle and set a first habit. About two minutes.</span>
          <span class="door-go">Start onboarding ${icon('arrowRight', { size: 16 })}</span>
        </button>
        <button class="door" data-action="startAs" data-value="member">
          <span class="door-icon">${icon('home')}</span>
          <strong>Member, three weeks in</strong>
          <span>Alex’s day: check in, cheer someone on, RSVP for Sunday, and find help for a stubborn habit.</span>
          <span class="door-go">Open Alex’s Circle ${icon('arrowRight', { size: 16 })}</span>
        </button>
        <button class="door" data-action="startAs" data-value="leader">
          <span class="door-icon">${icon('megaphone')}</span>
          <strong>Circle leader</strong>
          <span>Maya’s tools: who’s gone quiet, the meeting agenda, the next challenge, and starting a second Circle.</span>
          <span class="door-go">Lead as Maya ${icon('arrowRight', { size: 16 })}</span>
        </button>
        <button class="door door-org" data-action="startAs" data-value="org">
          <span class="door-icon">${icon('building')}</span>
          <strong>Organization</strong>
          <span>${s.org.name} runs sleep, running and stress programs for 120 employees, without seeing anyone’s private data.</span>
          <span class="door-go">Open the admin view ${icon('arrowRight', { size: 16 })}</span>
        </button>
      </div>
    </section>

    <section class="lp-how" id="how" aria-labelledby="how-h">
      <h2 id="how-h">How a Circle works</h2>
      <ol class="steps">
        <li><span class="step-n">1</span><h3>Name what you’re working on</h3><p>Better sleep, a first 5K, less stress. Say why it matters and what success looks like to you.</p></li>
        <li><span class="step-n">2</span><h3>Join five to seven people</h3><p>Same goal, similar schedule, a leader who keeps things moving. Small enough that you’re missed when you’re not there.</p></li>
        <li><span class="step-n">3</span><h3>Keep a shared rhythm</h3><p>A weekly meeting with a real agenda, a group challenge, and a quick daily check-in. Your habits are your own; the goal is shared.</p></li>
        <li><span class="step-n">4</span><h3>Bring in the experts</h3><p>Guides, live workshops and coaching built for your goal, plus honest recommendations for the products that help.</p></li>
      </ol>
    </section>

    <section class="lp-goals" aria-labelledby="goals-h">
      <h2 id="goals-h">One platform, many kinds of Circle</h2>
      <div class="goal-grid">
        ${GOAL_LIST.map((g) => html`<div class="goal-card" style="--g:${g.hue};--g-soft:${g.soft};--g-deep:${g.deep}"><span class="goal-card-icon">${icon(g.icon, { size: 22 })}</span><strong>${g.name}</strong><span>${g.pitch}</span></div>`)}
      </div>
    </section>

    <section class="lp-values" aria-labelledby="values-h">
      <h2 id="values-h" class="sr-only">What every Circle agrees to</h2>
      <div class="values">
        <div class="value v-kind"><strong>Kindness</strong><span>Everything comes back full circle.</span></div>
        <div class="value v-int"><strong>Intention</strong><span>Think about how you affect the circles around you.</span></div>
        <div class="value v-energy"><strong>Energy</strong><span>Elevate your circle.</span></div>
        <div class="value v-open"><strong>Openness</strong><span>Expand your circles.</span></div>
      </div>
    </section>

    <section class="lp-plus" id="plus" aria-labelledby="plus-h">
      <div>
        <h2 id="plus-h">Your Circle is free. The support around it is $5.</h2>
        <p class="lp-sub">Every member gets the Circle itself: the people, the meetings, the challenges and the starter guides. Plus adds the expertise that keeps you going when motivation fades.</p>
      </div>
      <div class="plans">
        <div class="plan">
          <h3>Circle</h3><p class="plan-price">Free<span> with an invite</span></p>
          <ul>
            <li>${icon('check', { size: 16 })}Your Circle of 5–7 people</li>
            <li>${icon('check', { size: 16 })}Weekly meetings and agendas</li>
            <li>${icon('check', { size: 16 })}Group challenges and check-ins</li>
            <li>${icon('check', { size: 16 })}Starter guides for your goal</li>
          </ul>
        </div>
        <div class="plan plan-plus">
          <h3>${plusTag('Circles Plus')}</h3><p class="plan-price">$5<span>/month</span> <em>or $50/year</em></p>
          <ul>
            <li>${icon('check', { size: 16 })}Full program library for your goal</li>
            <li>${icon('check', { size: 16 })}Weekly live workshops and replays</li>
            <li>${icon('check', { size: 16 })}Ask an expert, answered within a day</li>
            <li>${icon('check', { size: 16 })}One 15-minute coaching call a month</li>
            <li>${icon('check', { size: 16 })}Member perks from vetted partners</li>
          </ul>
        </div>
      </div>
    </section>

    <section class="lp-orgs" id="orgs" aria-labelledby="orgs-h">
      <div class="lp-orgs-copy">
        <h2 id="orgs-h">Turn a big community into small groups that work</h2>
        <p>Gyms, universities, employers and coaches already have the people. Circles gives them the structure: programs, trained leaders, automatic group matching, and participation reporting that never exposes anyone’s health details.</p>
        <button class="btn btn-teal" data-action="startAs" data-value="org">See ${s.org.name}’s admin view</button>
      </div>
      <ul class="org-examples">
        <li><span>${icon('dumbbell')}</span><strong>A gym</strong>runs a 6-week Strength Circle for new members</li>
        <li><span>${icon('book')}</span><strong>A university</strong>offers Student Wellness Circles in exam season</li>
        <li><span>${icon('building')}</span><strong>An employer</strong>sponsors Better Sleep Circles for every team</li>
        <li><span>${icon('run')}</span><strong>A coach</strong>launches Beginner Running Circles each spring</li>
      </ul>
    </section>

    <footer class="lp-foot">
      ${wordmark()}
      <span>Build community through shared goals.</span>
      <span class="lp-foot-fine">Prototype · ${new Date().getFullYear()}</span>
    </footer>
  </div>`;
}
