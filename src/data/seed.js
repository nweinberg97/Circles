// The demo world. Dates are generated relative to "now" so the prototype always
// feels current: the challenge is mid-week, the meeting is this coming Sunday.
import { GOALS } from './goals.js';
import { key, daysAgo, hoursAgo } from '../lib/dates.js';

function rng(seed) {
  let a = seed >>> 0;
  return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
const hash = (s) => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) | 0, 7);

const AVATAR_HUES = ['#F2C9B8', '#C9E4DE', '#D7D3F5', '#F6DFA9', '#BFDDF5', '#F3C4D5', '#CFE5B7', '#E9D3C0', '#B9E2EA', '#E7CDEB'];
const initials = (n) => n.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();

function person(id, name, extra = {}) {
  return { id, name, first: name.split(' ')[0], initials: initials(name), tint: AVATAR_HUES[Math.abs(hash(id)) % AVATAR_HUES.length], ...extra };
}

// ---------- People ----------
const P = [
  person('u_maya', 'Maya Okafor', { focus: 'Building a consistent bedtime', hood: 'Kitsilano', bio: 'Two kids, 6 AM starts. Started this Circle after one too many 1 AM scrolls.', lastActiveH: 1, rate: 0.82 }),
  person('u_alex', 'Alex Chen', { focus: 'Reducing late-night screen time', hood: 'Fairview', bio: 'Product designer. My phone and I need to see other people after 10 PM.', lastActiveH: 3, rate: 0.62 }),
  person('u_jordan', 'Jordan Reyes', { focus: 'Improving sleep quality', hood: 'Point Grey', bio: 'Grad student. Falling asleep is fine; staying asleep is the problem.', lastActiveH: 5, rate: 0.7 }),
  person('u_priya', 'Priya Raman', { focus: 'Building a wind-down routine', hood: 'Kitsilano', bio: 'ER nurse on days now, finally. Trying to teach my body that evenings are for slowing down.', lastActiveH: 2, rate: 0.86 }),
  person('u_sam', 'Sam Whitfield', { focus: 'Sleeping for better recovery', hood: 'Kerrisdale', bio: 'Training for my first half Ironman. My coach says sleep is the cheapest legal performance enhancer.', lastActiveH: 20, rate: 0.75 }),
  person('u_taylor', 'Taylor Brooks', { focus: 'Working on consistency', hood: 'Mount Pleasant', bio: 'Consultant, lots of travel. Good weeks at home, chaos on the road.', lastActiveH: 216, rate: 0.25 }),
  person('u_chris', 'Chris Dubois', { focus: 'Reducing caffeine', hood: 'Fairview', bio: 'Four coffees a day is a personality, apparently. Down to two.', lastActiveH: 9, rate: 0.55 }),
  // Night Owls (online sleep)
  person('u_rina', 'Rina Takeda', { focus: 'Shifting a late body clock', hood: 'Online · Burnaby', lastActiveH: 4, rate: 0.7 }),
  person('u_omar', 'Omar Haddad', { focus: 'Sleeping through the night', hood: 'Online · Victoria', lastActiveH: 30, rate: 0.6 }),
  person('u_june', 'June Park', { focus: 'Less doomscrolling in bed', hood: 'Online · Calgary', lastActiveH: 12, rate: 0.65 }),
  person('u_felix', 'Felix Martin', { focus: 'New dad, any sleep at all', hood: 'Online · Seattle', lastActiveH: 6, rate: 0.4 }),
  person('u_ana', 'Ana Souza', { focus: 'Earlier, steadier bedtime', hood: 'Online · Vancouver', lastActiveH: 15, rate: 0.7 }),
  // First 5K
  person('u_owen', 'Owen Park', { focus: 'Coaching my first Circle to a finish line', hood: 'Kitsilano', lastActiveH: 2, rate: 0.85 }),
  person('u_lucia', 'Lucia Romero', { focus: 'Running 5K without walking', hood: 'Kitsilano', lastActiveH: 7, rate: 0.72 }),
  person('u_dev', 'Dev Malhotra', { focus: 'Back to fitness after a knee injury', hood: 'Fairview', lastActiveH: 26, rate: 0.55 }),
  person('u_hannah', 'Hannah Wells', { focus: 'Sun Run in April', hood: 'Arbutus', lastActiveH: 10, rate: 0.68 }),
  person('u_marco', 'Marco Bianchi', { focus: 'Something just for me', hood: 'Kitsilano', lastActiveH: 40, rate: 0.5 }),
  // Strength
  person('u_amira', 'Amira Yusuf', { focus: 'Teaching beginners to lift', hood: 'Mount Pleasant', lastActiveH: 3, rate: 0.85 }),
  person('u_tom', 'Tom Becker', { focus: 'A stronger back', hood: 'Mount Pleasant', lastActiveH: 20, rate: 0.6 }),
  person('u_mei', 'Mei Lin', { focus: 'First barbell squat', hood: 'Main St', lastActiveH: 8, rate: 0.7 }),
  person('u_kofi', 'Kofi Mensah', { focus: 'Training twice a week', hood: 'Riley Park', lastActiveH: 50, rate: 0.5 }),
  person('u_sara', 'Sara Lindqvist', { focus: 'Strength for skiing', hood: 'Mount Pleasant', lastActiveH: 14, rate: 0.66 }),
  person('u_jake', 'Jake Morrison', { focus: 'Getting over gym anxiety', hood: 'Strathcona', lastActiveH: 70, rate: 0.4 }),
  // Meditation
  person('u_iris', 'Iris Nakamura', { focus: 'Ten minutes before the kids wake', hood: 'Online', lastActiveH: 5, rate: 0.8 }),
  person('u_luke', 'Luke Fraser', { focus: 'Less reactive at work', hood: 'Online', lastActiveH: 30, rate: 0.55 }),
  person('u_zara', 'Zara Ahmed', { focus: 'Quieter mind before exams', hood: 'Online', lastActiveH: 11, rate: 0.6 }),
  person('u_ben', 'Ben Cole', { focus: 'Staying with it this time', hood: 'Online', lastActiveH: 22, rate: 0.5 }),
  // Nutrition
  person('u_nina', 'Nina Petrova', { focus: 'Cooking four nights a week', hood: 'East Van', lastActiveH: 6, rate: 0.75 }),
  person('u_raj', 'Raj Patel', { focus: 'Fewer takeout nights', hood: 'Commercial Dr', lastActiveH: 18, rate: 0.6 }),
  person('u_ella', 'Ella Thompson', { focus: 'Steady energy at work', hood: 'East Van', lastActiveH: 9, rate: 0.65 }),
  person('u_sol', 'Sol Ramirez', { focus: 'Learning to meal prep', hood: 'Hastings-Sunrise', lastActiveH: 36, rate: 0.5 }),
  person('u_greta', 'Greta Holm', { focus: 'More vegetables, less guilt', hood: 'Grandview', lastActiveH: 12, rate: 0.7 }),
  // Stress
  person('u_leah', 'Leah Goldberg', { focus: 'Logging off by six', hood: 'Online', lastActiveH: 4, rate: 0.7 }),
  person('u_kai', 'Kai Nakoa', { focus: 'Real lunch breaks', hood: 'Online', lastActiveH: 13, rate: 0.6 }),
  person('u_ines', 'Inês Costa', { focus: 'Calmer mornings', hood: 'Online', lastActiveH: 27, rate: 0.55 }),
  person('u_will', 'Will Turner', { focus: 'Sunday scaries', hood: 'Online', lastActiveH: 8, rate: 0.65 }),
  person('u_fatima', 'Fatima Bello', { focus: 'Saying no more often', hood: 'Online', lastActiveH: 16, rate: 0.6 }),
  person('u_oscar', 'Oscar Nilsson', { focus: 'Less work on weekends', hood: 'Online', lastActiveH: 60, rate: 0.45 }),
  // Back into running
  person('u_gail', 'Gail Morton', { focus: 'Running again at 52', hood: 'North Vancouver', lastActiveH: 5, rate: 0.75 }),
  person('u_peter', 'Peter Shaw', { focus: 'Keeping up with my daughter', hood: 'Lonsdale', lastActiveH: 20, rate: 0.6 }),
  person('u_rosa', 'Rosa Diaz', { focus: 'Seawall without stopping', hood: 'Lower Lonsdale', lastActiveH: 33, rate: 0.55 }),
  // Waitlist for Better Sleep
  person('u_hana', 'Hana Kim', { focus: 'Getting to sleep before midnight', hood: 'Kitsilano', lastActiveH: 48 }),
  person('u_leo', 'Leo Marchetti', { focus: 'Waking up less at night', hood: 'Fairview', lastActiveH: 30 }),
];

// ---------- Circles ----------
const AGREEMENTS = [
  { value: 'Kindness', line: 'Everything comes back full circle. Cheer the small stuff.' },
  { value: 'Intention', line: 'Show up on Sundays, or say so by Friday.' },
  { value: 'Energy', line: 'Elevate your circle. Share what’s working, not just what isn’t.' },
  { value: 'Openness', line: 'Bad weeks are welcome here. No one is behind.' },
];

const STANDARD_AGENDA = [
  { id: 'a1', title: 'Check in: one word for your week', mins: 5 },
  { id: 'a2', title: 'What went well?', mins: 10 },
  { id: 'a3', title: 'What was difficult?', mins: 10 },
  { id: 'a4', title: 'What are you working on this week?', mins: 10 },
  { id: 'a5', title: 'Group challenge', mins: 5 },
  { id: 'a6', title: 'Commitments', mins: 10 },
  { id: 'a7', title: 'Coffee and the fun part', mins: 10 },
];

function lightCircle(spec) {
  return {
    agreements: AGREEMENTS,
    agenda: STANDARD_AGENDA.map((a) => ({ ...a })),
    visibility: 'request',
    size: 7,
    pastMeetings: [],
    waitlist: [],
    invites: [],
    rsvp: {},
    ...spec,
    challenge: { ...GOALS[spec.goal].challenges[0], startedDaysAgo: spec.challengeDay ?? 2 },
  };
}

function buildCircles({ fresh }) {
  const sleepMembers = ['u_maya', 'u_alex', 'u_jordan', 'u_priya', 'u_sam', 'u_taylor', 'u_chris'];
  const sleep = {
    id: 'c_sleep', name: 'Better Sleep — Vancouver', goal: 'sleep', leaderId: 'u_maya',
    memberIds: fresh ? sleepMembers.filter((m) => m !== 'u_alex') : sleepMembers,
    invites: fresh ? [{ id: 'inv_alex', uid: 'u_alex', email: 'alex.chen@hey.com', sentH: 26 }] : [],
    size: 7, visibility: 'invite', place: 'Kitsilano, Vancouver', format: 'Hybrid',
    sharedGoal: '7+ hours of sleep, 5 nights a week, by the end of November',
    about: 'Seven neighbours on the west side trying to stop treating sleep as optional. Mostly working adults, two parents, one triathlete. We meet Sundays over coffee and keep each other honest in between.',
    rhythm: { dow: 0, time: '10:00', mins: 60, format: 'Hybrid', venue: 'Bean Around the World', address: '1945 Cornwall Ave, Vancouver', link: 'meet.circles.app/better-sleep-van' },
    agenda: STANDARD_AGENDA.map((a) => ({ ...a })),
    agreements: AGREEMENTS,
    challenge: { ...GOALS.sleep.challenges[0], startedDaysAgo: 3 },
    rsvp: { u_maya: 'yes', u_priya: 'yes', u_jordan: 'yes', u_sam: 'yes', u_chris: 'maybe' },
    waitlist: ['u_hana', 'u_leo'],
    startedWeeksAgo: 5,
    pastMeetings: [
      {
        id: 'm_last', daysAgo: 7, attended: ['u_maya', 'u_alex', 'u_jordan', 'u_priya', 'u_sam', 'u_chris'],
        notes: 'Talked about why evenings slip: everyone’s wind-down falls apart on work-late nights. Priya’s “paper book + tea” combo was the hit of the week. Agreed to try the 7-Day Wind-Down Challenge together, starting Thursday.',
        commitments: [
          { uid: 'u_maya', text: 'Lights out by 10:45, four nights' },
          { uid: 'u_alex', text: 'Phone charges in the kitchen from 10 PM' },
          { uid: 'u_jordan', text: 'No alcohol on weeknights' },
          { uid: 'u_priya', text: 'Keep the paper-book routine going' },
          { uid: 'u_sam', text: 'In bed by 10 the night before long rides' },
          { uid: 'u_chris', text: 'Last coffee before 2 PM' },
        ],
      },
      { id: 'm_prev', daysAgo: 14, attended: ['u_maya', 'u_alex', 'u_priya', 'u_sam', 'u_taylor', 'u_chris'], notes: 'Shared our sleep “villains”. Most common: phones, caffeine, and replaying the workday. Set the Circle goal: 7+ hours, five nights a week, by the end of November.', commitments: [] },
    ],
    availability: {
      // how many members can make each slot: [dow][slotIndex]; slots: 7AM, 9AM, 10AM, 12PM, 6PM, 8PM
      grid: [[2, 5, 7, 6, 3, 2], [3, 1, 0, 1, 4, 5], [2, 1, 0, 1, 5, 4], [3, 1, 0, 2, 4, 6], [2, 1, 1, 1, 3, 3], [1, 0, 0, 2, 2, 1], [4, 5, 5, 4, 2, 1]],
    },
  };

  const circles = [
    sleep,
    lightCircle({ id: 'c_owls', name: 'Night Owls Reset', goal: 'sleep', leaderId: 'u_rina', memberIds: ['u_rina', 'u_omar', 'u_june', 'u_felix', 'u_ana'], place: 'Online', format: 'Online', sharedGoal: 'In bed before midnight, six nights a week', about: 'For people whose body clock runs late. Video check-ins on Tuesday evenings, lots of async encouragement between.', rhythm: { dow: 2, time: '20:00', mins: 45, format: 'Online', link: 'meet.circles.app/night-owls' }, startedWeeksAgo: 3, level: 'Any', time: 'Evenings' }),
    lightCircle({ id: 'c_5k', name: 'First 5K — Kitsilano', goal: 'run', leaderId: 'u_owen', memberIds: ['u_owen', 'u_lucia', 'u_dev', 'u_hannah', 'u_marco'], place: 'Kitsilano, Vancouver', format: 'In person', sharedGoal: 'Everyone runs the Sun Run 5K in April — together', about: 'Total beginners welcome. We run Saturday mornings from Kits Beach and walk as much as we need to.', rhythm: { dow: 6, time: '08:00', mins: 60, format: 'In person', venue: 'Kitsilano Beach Park', address: 'By the volleyball courts' }, startedWeeksAgo: 2, level: 'New to this', time: 'Weekends', challengeDay: 1 }),
    lightCircle({ id: 'c_strength', name: 'Strength from Scratch', goal: 'strength', leaderId: 'u_amira', memberIds: ['u_amira', 'u_tom', 'u_mei', 'u_kofi', 'u_sara', 'u_jake'], place: 'Mount Pleasant, Vancouver', format: 'In person', sharedGoal: 'Two sessions a week for six weeks, good form first', about: 'Beginners learning the five main lifts together at Flex Studio. No egos, lots of high fives.', rhythm: { dow: 1, time: '18:30', mins: 60, format: 'In person', venue: 'Flex Studio', address: '2580 Main St' }, startedWeeksAgo: 4, level: 'New to this', time: 'Evenings' }),
    lightCircle({ id: 'c_sit', name: 'Ten Minutes a Day', goal: 'meditation', leaderId: 'u_iris', memberIds: ['u_iris', 'u_luke', 'u_zara', 'u_ben'], place: 'Online', format: 'Online', sharedGoal: 'Sit for ten minutes, every day for 30 days', about: 'A quiet, early Circle. We sit together on video Wednesday mornings and check in daily.', rhythm: { dow: 3, time: '07:00', mins: 30, format: 'Online', link: 'meet.circles.app/ten-minutes' }, startedWeeksAgo: 2, level: 'Any', time: 'Mornings' }),
    lightCircle({ id: 'c_cook', name: 'Cook More, Stress Less', goal: 'nutrition', leaderId: 'u_nina', memberIds: ['u_nina', 'u_raj', 'u_ella', 'u_sol', 'u_greta'], size: 6, place: 'East Vancouver', format: 'Hybrid', sharedGoal: 'Cook dinner at home four nights a week', about: 'Swapping recipes, shopping lists and pep talks. Sunday afternoons, sometimes in someone’s kitchen.', rhythm: { dow: 0, time: '16:00', mins: 60, format: 'Hybrid', venue: 'Rotating kitchens', link: 'meet.circles.app/cook-more' }, startedWeeksAgo: 6, level: 'Any', time: 'Weekends' }),
    lightCircle({ id: 'c_calm', name: 'Calm Under Deadline', goal: 'stress', leaderId: 'u_leah', memberIds: ['u_leah', 'u_kai', 'u_ines', 'u_will', 'u_fatima', 'u_oscar'], place: 'Online', format: 'Online', sharedGoal: 'Log off by 6 PM, four days a week', about: 'People with demanding jobs learning to leave work at work. Lunchtime video meetups.', rhythm: { dow: 4, time: '12:15', mins: 30, format: 'Online', link: 'meet.circles.app/calm-deadline' }, startedWeeksAgo: 5, level: 'Any', time: 'Lunch' }),
    lightCircle({ id: 'c_back', name: 'Back Into Running 40+', goal: 'run', leaderId: 'u_gail', memberIds: ['u_gail', 'u_peter', 'u_rosa'], size: 6, place: 'North Vancouver', format: 'In person', sharedGoal: 'Run the Lonsdale Quay loop without stopping by December', about: 'For people who used to run and want it back. Gentle pace, Sunday mornings by the water.', rhythm: { dow: 0, time: '09:00', mins: 60, format: 'In person', venue: 'Lonsdale Quay', address: 'Meet by the market doors' }, startedWeeksAgo: 1, level: 'Some experience', time: 'Weekends' }),
  ];
  sleep.level = 'Any';
  sleep.time = 'Weekends';
  return Object.fromEntries(circles.map((c) => [c.id, c]));
}

// ---------- Posts ----------
function buildPosts({ fresh }) {
  const posts = [
    { id: 'p1', circleId: 'c_sleep', uid: 'u_maya', type: 'announcement', pinned: true, at: hoursAgo(14), text: 'Day 4 of the Wind-Down Challenge — we’re past halfway! On Sunday let’s each bring one thing that actually worked this week, and one thing we’re dropping. Coffee’s on me.', cheers: ['u_priya', 'u_jordan', 'u_sam'], metoo: [], replies: [] },
    { id: 'p2', circleId: 'c_sleep', uid: 'u_priya', type: 'win', at: hoursAgo(9), text: 'Three nights in a row of lights out before 11. The herbal tea + paper book combo is doing more than I expected. Who knew boring was the secret.', cheers: ['u_maya', 'u_chris', 'u_sam'].concat(fresh ? [] : ['u_alex']), metoo: [], replies: [{ id: 'r1', uid: 'u_jordan', at: hoursAgo(8), text: 'Stealing this. What book?' }, { id: 'r2', uid: 'u_priya', at: hoursAgo(7), text: '“A Gentleman in Moscow”. Slow in the best way.' }] },
    { id: 'p3', circleId: 'c_sleep', uid: 'u_chris', type: 'struggle', at: hoursAgo(20), text: 'Had a 3 PM latte without even thinking about it. Wired until 1 AM. Resetting tonight.', cheers: ['u_maya'], metoo: ['u_jordan', 'u_taylor'], replies: [{ id: 'r3', uid: 'u_jordan', at: hoursAgo(19), text: 'Happens. Switching to decaf after lunch was the thing that worked for me in week 2.' }, { id: 'r4', uid: 'u_maya', at: hoursAgo(18), text: 'One latte doesn’t undo a week. Tonight counts.' }] },
    { id: 'p4', circleId: 'c_sleep', uid: 'u_sam', type: 'question', at: hoursAgo(26), text: 'Who’s up for a 7 AM walk Saturday? Morning light is supposedly half the battle. Kits Beach, then coffee.', cheers: [], metoo: [], replies: [], join: { label: 'Saturday 7 AM walk', going: ['u_sam', 'u_priya', 'u_maya'] } },
    { id: 'p5', circleId: 'c_sleep', uid: 'u_jordan', type: 'checkin', at: hoursAgo(31), text: 'Slept 7h20. First time this month I woke up before my alarm.', cheers: ['u_maya', 'u_priya', 'u_sam', 'u_chris'], metoo: [], replies: [] },
    { id: 'p6', circleId: 'c_sleep', uid: 'u_taylor', type: 'struggle', at: hoursAgo(216), text: 'Rough couple of weeks with work travel. Will try to get back on track when I’m home.', cheers: ['u_maya', 'u_priya'], metoo: [], replies: [{ id: 'r5', uid: 'u_maya', at: hoursAgo(214), text: 'No pressure. We’re here when you land.' }] },
  ];
  if (!fresh) {
    posts.splice(3, 0, { id: 'p7', circleId: 'c_sleep', uid: 'u_alex', type: 'win', at: hoursAgo(22), text: 'Phone slept in the kitchen four nights straight. I read twelve pages of an actual book. Small, but it’s been a year.', cheers: ['u_maya', 'u_priya', 'u_jordan', 'u_chris'], metoo: [], replies: [{ id: 'r6', uid: 'u_priya', at: hoursAgo(21), text: 'Twelve pages is not small!' }] });
  }
  // Other circles
  posts.push(
    { id: 'q1', circleId: 'c_5k', uid: 'u_owen', type: 'announcement', pinned: true, at: hoursAgo(10), text: 'Saturday: 8 intervals of 1 min run / 2 min walk. Meet by the volleyball courts at 7:55. Bring water and zero expectations.', cheers: ['u_lucia', 'u_hannah'], metoo: [], replies: [] },
    { id: 'q2', circleId: 'c_5k', uid: 'u_lucia', type: 'win', at: hoursAgo(28), text: 'Did my first run alone this morning! Only walked once more than planned.', cheers: ['u_owen', 'u_dev', 'u_hannah', 'u_marco'], metoo: [], replies: [{ id: 'q2r', uid: 'u_dev', at: hoursAgo(27), text: 'That’s huge. Solo runs are the hardest.' }] },
    { id: 'q3', circleId: 'c_5k', uid: 'u_dev', type: 'struggle', at: hoursAgo(40), text: 'Knee was grumpy after Saturday. Taking it easy and doing the mobility routine.', cheers: ['u_owen'], metoo: ['u_marco'], replies: [] },
    { id: 'o1', circleId: 'c_owls', uid: 'u_rina', type: 'announcement', pinned: true, at: hoursAgo(12), text: 'This week: phone in another room from 11. Report back Tuesday!', cheers: ['u_ana', 'u_june'], metoo: [], replies: [] },
    { id: 'o2', circleId: 'c_owls', uid: 'u_felix', type: 'struggle', at: hoursAgo(7), text: 'Baby slept 4 hours straight. I counted it as a party.', cheers: ['u_rina', 'u_omar', 'u_june', 'u_ana'], metoo: [], replies: [] },
    { id: 's1', circleId: 'c_strength', uid: 'u_amira', type: 'announcement', pinned: true, at: hoursAgo(16), text: 'Monday: goblet squats and rows. If you film one set, I’ll send form notes.', cheers: ['u_mei'], metoo: [], replies: [] },
    { id: 's2', circleId: 'c_strength', uid: 'u_mei', type: 'win', at: hoursAgo(30), text: 'Squatted the 16 kg kettlebell for 3×8. Last month I was scared of the dumbbell rack.', cheers: ['u_amira', 'u_sara', 'u_tom'], metoo: [], replies: [] },
    { id: 'm1', circleId: 'c_sit', uid: 'u_iris', type: 'announcement', pinned: true, at: hoursAgo(20), text: 'Day 12 of 30. Wednesday’s sit is a body scan. Cameras optional, as always.', cheers: ['u_zara'], metoo: [], replies: [] },
    { id: 'n1', circleId: 'c_cook', uid: 'u_nina', type: 'announcement', pinned: true, at: hoursAgo(18), text: 'Sunday at mine: we’re batch-cooking a big lentil soup. Bring a container.', cheers: ['u_raj', 'u_ella', 'u_greta'], metoo: [], replies: [] },
    { id: 't1', circleId: 'c_calm', uid: 'u_leah', type: 'announcement', pinned: true, at: hoursAgo(22), text: 'Shutdown ritual week! Post a photo of your closed laptop at 6.', cheers: ['u_kai', 'u_will'], metoo: [], replies: [] },
    { id: 'b1', circleId: 'c_back', uid: 'u_gail', type: 'announcement', pinned: true, at: hoursAgo(30), text: 'Sunday 9 AM by the market doors. We’ll do the short loop twice.', cheers: ['u_rosa'], metoo: [], replies: [] },
  );
  return posts;
}

// ---------- Logs ----------
function buildCheckins(circles, people, { fresh }) {
  const goalOpts = (g) => GOALS[g].checkin.options;
  const checkins = {};
  for (const c of Object.values(circles)) {
    const opts = goalOpts(c.goal);
    for (const uid of c.memberIds) {
      if (fresh && uid === 'u_alex') continue;
      const p = people[uid];
      const r = rng(hash(uid + c.id));
      checkins[uid] = checkins[uid] || {};
      const lastActiveDays = Math.floor((p.lastActiveH || 0) / 24);
      for (let d = 1; d <= 28; d++) {
        if (d <= lastActiveDays && lastActiveDays > 2) continue;
        if (r() > 0.85) continue; // forgot to log
        const hit = r() < (p.rate ?? 0.6);
        const pool = opts.filter((o) => o.hit === hit);
        checkins[uid][key(daysAgo(d))] = pool[Math.floor(r() * pool.length)].v;
      }
    }
  }
  return checkins;
}

function buildHabits({ fresh }) {
  const alexHabits = [
    { id: 'phone-kitchen', title: 'Phone charges outside the bedroom', detail: 'Plug it in by 10:00 PM' },
    { id: 'wind-down', title: '30-minute wind-down', detail: 'No screens, low light, something calm', challenge: true },
    { id: 'morning-light', title: 'Morning light', detail: '10 minutes outside within an hour of waking' },
  ];
  const mayaHabits = [
    { id: 'lights-out', title: 'Lights out by 10:45', detail: 'Four nights a week to start' },
    { id: 'wind-down', title: '30-minute wind-down', detail: 'Bath, book, bed', challenge: true },
    { id: 'same-wake', title: 'Same wake time, weekends too', detail: '6:15, even Saturdays' },
  ];
  const habitLog = { u_alex: {}, u_maya: {} };
  const fill = (uid, habits, rate) => {
    const r = rng(hash(uid + 'habits'));
    for (let d = 1; d <= 35; d++) {
      const k = key(daysAgo(d));
      habitLog[uid][k] = {};
      habits.forEach((h) => { if (r() < rate) habitLog[uid][k][h.id] = true; });
    }
  };
  if (!fresh) fill('u_alex', alexHabits, 0.68);
  fill('u_maya', mayaHabits, 0.8);
  // Alex already did morning light today in the established demo.
  if (!fresh) habitLog.u_alex[key()] = { 'morning-light': true };
  return { habits: { u_alex: fresh ? [] : alexHabits, u_maya: mayaHabits }, habitLog };
}

function buildChallengeLog(circles, { fresh }) {
  const log = {};
  for (const c of Object.values(circles)) {
    log[c.id] = {};
    const day = c.challenge.startedDaysAgo; // days completed before today
    c.memberIds.forEach((uid) => {
      if (fresh && uid === 'u_alex') return;
      const r = rng(hash(uid + c.id + 'ch'));
      const done = [];
      for (let i = 0; i < day; i++) done.push(r() < (uid === 'u_taylor' ? 0.1 : 0.8));
      log[c.id][uid] = done;
    });
  }
  return log;
}

// ---------- Organization (B2B) ----------
function buildOrg() {
  const mk = (id, programId, name, leader, members, engagement, attendance, extra = {}) => ({ id, programId, name, leader, members, size: 7, engagement, attendance, ...extra });
  return {
    name: 'Harbourline',
    kind: 'Employer',
    tagline: 'Logistics software · 640 people · Vancouver & Toronto',
    admin: { name: 'Dana Whitaker', role: 'People & Culture lead', initials: 'DW' },
    sponsoredPlus: true,
    domain: 'harbourline.com',
    autoJoin: true,
    seatsPurchased: 120,
    pricePerSeat: 4,
    programs: [
      { id: 'pr_sleep', name: 'Better Sleep Circles', goal: 'sleep', weeks: 6, week: 3, status: 'Running', blurb: 'Six weeks of small-group support for anyone running on empty.' },
      { id: 'pr_run', name: 'Sun Run Ready', goal: 'run', weeks: 10, week: 2, status: 'Running', blurb: 'Couch to 5K in time for the April Sun Run, with a company team at the finish.' },
      { id: 'pr_stress', name: 'Calm Under Deadline', goal: 'stress', weeks: 0, week: 0, status: 'Ongoing', blurb: 'Year-round Circles for teams in crunch-heavy roles.' },
    ],
    circles: [
      mk('oc1', 'pr_sleep', 'Sleep · Product & Design', 'Alex Chen', 7, 84, 90),
      mk('oc2', 'pr_sleep', 'Sleep · Operations', 'Marisol Vega', 6, 77, 83),
      mk('oc3', 'pr_sleep', 'Sleep · Toronto office', 'Kwame Asante', 7, 52, 61, { flag: 'Attendance dipped two weeks running' }),
      mk('oc4', 'pr_sleep', 'Sleep · Parents', 'Ruth Abramson', 6, 88, 92),
      mk('oc5', 'pr_run', 'Sun Run · Morning crew', 'Jess Liang', 7, 81, 86),
      mk('oc6', 'pr_run', 'Sun Run · Lunch loop', null, 5, 0, 0, { flag: 'Needs a leader' }),
      mk('oc7', 'pr_run', 'Sun Run · Engineering', 'Tobias Grant', 6, 73, 80),
      mk('oc8', 'pr_stress', 'Calm · Customer Support', 'Priscilla Owusu', 7, 79, 85),
      mk('oc9', 'pr_stress', 'Calm · Sales', 'Ethan Brooks', 6, 66, 72),
    ],
    leaders: [
      { name: 'Alex Chen', team: 'Product Design', trained: true, circles: 1, since: 'Sep' },
      { name: 'Marisol Vega', team: 'Operations', trained: true, circles: 1, since: 'Sep' },
      { name: 'Kwame Asante', team: 'Engineering, Toronto', trained: false, circles: 1, since: 'Sep' },
      { name: 'Ruth Abramson', team: 'Finance', trained: true, circles: 1, since: 'Sep' },
      { name: 'Jess Liang', team: 'Marketing', trained: true, circles: 1, since: 'Sep' },
      { name: 'Tobias Grant', team: 'Engineering', trained: true, circles: 1, since: 'Oct' },
      { name: 'Priscilla Owusu', team: 'Customer Support', trained: true, circles: 1, since: 'Jun' },
      { name: 'Ethan Brooks', team: 'Sales', trained: false, circles: 1, since: 'Jul' },
    ],
    volunteers: [
      { name: 'Grace Okonkwo', team: 'Customer Support', note: 'Ran the office walking club last year' },
      { name: 'Daniel Ruiz', team: 'Engineering', note: 'Ran the 2025 Sun Run' },
    ],
    unplaced: [
      { name: 'Ava Morgan', team: 'Finance', goal: 'run', times: 'Mornings' },
      { name: 'Noah Bennett', team: 'Engineering', goal: 'run', times: 'Lunch' },
      { name: 'Chloe Dupont', team: 'Operations', goal: 'run', times: 'Lunch' },
      { name: 'Ibrahim Saleh', team: 'Sales', goal: 'run', times: 'Mornings' },
      { name: 'Mia Johansson', team: 'Product', goal: 'run', times: 'Lunch' },
      { name: 'Lucas Ferreira', team: 'Engineering', goal: 'run', times: 'Mornings' },
      { name: 'Sofia Rossi', team: 'Customer Support', goal: 'run', times: 'Lunch' },
      { name: 'Ethan Clarke', team: 'Operations', goal: 'run', times: 'Mornings' },
      { name: 'Olivia Hart', team: 'Marketing', goal: 'run', times: 'Lunch' },
    ],
    trend: [38, 44, 51, 55, 58, 63, 66, 71],
    invited: 74,
  };
}

export function createSeed({ fresh = false } = {}) {
  const people = Object.fromEntries(P.map((p) => [p.id, { ...p, lastActive: hoursAgo(p.lastActiveH ?? 24) }]));
  const circles = buildCircles({ fresh });
  const { habits, habitLog } = buildHabits({ fresh });
  return {
    version: 3,
    mode: fresh ? 'fresh' : 'established',
    persona: 'member',
    me: { member: 'u_alex', leader: 'u_maya' },
    onboarded: !fresh,
    myCircle: { u_alex: fresh ? null : 'c_sleep', u_maya: 'c_sleep' },
    leading: { u_maya: ['c_sleep'] },
    goals: {
      u_alex: fresh ? null : { goal: 'sleep', title: 'Asleep by 11:30 on work nights', why: 'I’m tired of starting every day behind, and I want my evenings back from my phone.', success: 'Asleep by 11:30, five nights a week, and waking up without three alarms.', by: 'End of November', prefs: { format: 'Either', times: ['Weekends', 'Evenings'] } },
      u_maya: { goal: 'sleep', title: 'Lights out by 10:45', why: 'My kids get the tired version of me in the mornings. I want them to get the good one.', success: 'Lights out by 10:45 four nights a week, and no 1 AM scrolling.', by: 'End of November' },
    },
    plus: { u_alex: { status: 'free' }, u_maya: { status: 'plus', plan: 'yearly', since: 'Aug 2026' } },
    people,
    circles,
    posts: buildPosts({ fresh }),
    checkins: buildCheckins(circles, people, { fresh }),
    habits,
    habitLog,
    challengeLog: buildChallengeLog(circles, { fresh }),
    notes: fresh ? [] : [
      { id: 'n1', from: 'u_priya', to: 'u_alex', at: hoursAgo(5), text: 'The phone-in-the-kitchen trick is genius. I’m stealing it this week.' },
    ],
    requests: [],
    support: { registered: { u_maya: { 'w-winddown': true } }, questions: [], bookings: [], saved: {} },
    org: buildOrg(),
    ui: { modal: null, toast: null, discover: { goal: 'all', format: 'all', time: 'all' }, supportGoal: null, composer: 'win', partnersOnly: 'all' },
  };
}
