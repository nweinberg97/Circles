// Everything that makes a goal feel like its own experience: language, the daily
// check-in, habit ideas, challenges, and the curated support around it.

export const GOALS = {
  sleep: {
    id: 'sleep', name: 'Better sleep', short: 'Sleep', icon: 'moon', hue: '#5B67E0', soft: '#ECEEFD', deep: '#2B3478',
    pitch: 'A steadier bedtime, quieter evenings, and mornings that don’t start behind.',
    checkin: {
      question: 'How much did you sleep last night?',
      options: [
        { v: 'lt6', label: 'Under 6h', hit: false },
        { v: '6-7', label: '6–7h', hit: false },
        { v: '7-8', label: '7–8h', hit: true },
        { v: '8+', label: '8h+', hit: true },
      ],
      hitLabel: 'nights at 7h+',
    },
    whyIdeas: ['I want more energy for my kids', 'Work stress follows me to bed', 'I’m tired of three alarms', 'I want my evenings back from my phone'],
    successIdeas: ['Asleep by 11:30 on work nights', '7+ hours, 5 nights a week', 'Wake up without a snooze'],
    habits: [
      { id: 'phone-kitchen', title: 'Phone charges outside the bedroom', detail: 'Plug it in by 10:00 PM' },
      { id: 'wind-down', title: '30-minute wind-down', detail: 'No screens, low light, something calm' },
      { id: 'caffeine-cutoff', title: 'No caffeine after 2 PM', detail: 'Decaf and tea count as wins' },
      { id: 'morning-light', title: 'Morning light', detail: '10 minutes outside within an hour of waking' },
      { id: 'same-wake', title: 'Same wake time, weekends too', detail: 'Within 30 minutes is close enough' },
      { id: 'breathing', title: '5 minutes of slow breathing', detail: 'In bed, lights off' },
    ],
    challenges: [
      { id: 'wind-down-7', title: '7-Day Wind-Down Challenge', action: '30 screen-free minutes before lights out', days: 7 },
      { id: 'caffeine-5', title: 'Caffeine Cutoff Week', action: 'Last coffee before 2 PM', days: 5 },
      { id: 'light-7', title: 'Morning Light Week', action: '10 minutes outside after waking', days: 7 },
      { id: 'phone-free-14', title: 'Phone-Free Bedroom', action: 'Phone sleeps outside your room', days: 14 },
    ],
  },
  run: {
    id: 'run', name: 'First 5K', short: 'Running', icon: 'run', hue: '#D9772E', soft: '#FCEEE2', deep: '#7A3A0E',
    pitch: 'From the couch to a finish line, with people who are just as nervous as you.',
    checkin: {
      question: 'Did you get your run in?',
      options: [
        { v: 'rest', label: 'Rest day', hit: false },
        { v: 'walk', label: 'Walked instead', hit: false },
        { v: 'done', label: 'Ran my plan', hit: true },
        { v: 'extra', label: 'Went further', hit: true },
      ],
      hitLabel: 'runs this week',
    },
    whyIdeas: ['I want to keep up with my kids', 'I used to run and miss it', 'I signed up for a race and panicked', 'Running clears my head'],
    successIdeas: ['Run 5K without stopping', 'Finish the Sun Run in April', 'Three runs a week by December'],
    habits: [
      { id: 'run-3', title: 'Run three times a week', detail: 'Follow this week’s intervals' },
      { id: 'mobility', title: '8 minutes of mobility', detail: 'Hips, calves, ankles' },
      { id: 'shoes-out', title: 'Lay out kit the night before', detail: 'Remove one excuse' },
      { id: 'easy-pace', title: 'Keep it conversational', detail: 'If you can’t talk, slow down' },
    ],
    challenges: [
      { id: 'streak-3', title: 'Three Runs This Week', action: 'Any three runs, any distance', days: 7 },
      { id: 'mobility-7', title: 'Mobility Minutes', action: '8 minutes of mobility daily', days: 7 },
    ],
  },
  strength: {
    id: 'strength', name: 'Strength training', short: 'Strength', icon: 'dumbbell', hue: '#C04B3B', soft: '#FAE9E6', deep: '#6B2117',
    pitch: 'Learn the basics, lift with confidence, and actually look forward to the gym.',
    checkin: {
      question: 'Did you train today?',
      options: [
        { v: 'rest', label: 'Rest day', hit: false },
        { v: 'short', label: 'Short session', hit: true },
        { v: 'done', label: 'Full session', hit: true },
      ],
      hitLabel: 'sessions this week',
    },
    whyIdeas: ['I want to feel strong, not just thin', 'My back needs it', 'The weight room intimidates me'],
    successIdeas: ['Train twice a week for 6 weeks', 'Bodyweight squat with good form', 'Learn the five main lifts'],
    habits: [
      { id: 'two-sessions', title: 'Two sessions a week', detail: 'Monday and Thursday' },
      { id: 'protein', title: 'Protein with breakfast', detail: 'Eggs, yogurt, or a shake' },
      { id: 'log', title: 'Log your lifts', detail: 'Notebook or phone, either works' },
    ],
    challenges: [{ id: 'form-week', title: 'Form First Week', action: 'Film one set and share a note', days: 7 }],
  },
  meditation: {
    id: 'meditation', name: 'Meditation', short: 'Meditation', icon: 'lotus', hue: '#1E9A8F', soft: '#E1F4F1', deep: '#0C4A44',
    pitch: 'Ten quiet minutes a day, kept going by people sitting alongside you.',
    checkin: {
      question: 'Did you sit today?',
      options: [
        { v: 'no', label: 'Not today', hit: false },
        { v: 'short', label: 'A few minutes', hit: true },
        { v: 'done', label: '10 minutes+', hit: true },
      ],
      hitLabel: 'days practiced',
    },
    whyIdeas: ['My mind won’t switch off', 'I want to react less', 'I’ve tried apps alone and drifted'],
    successIdeas: ['10 minutes a day for a month', 'Sit five mornings a week'],
    habits: [
      { id: 'ten-min', title: '10-minute sit', detail: 'Same spot, same time' },
      { id: 'one-breath', title: 'One mindful breath before meetings', detail: 'Tiny counts' },
    ],
    challenges: [{ id: 'sit-10', title: '10 Days of 10 Minutes', action: 'Ten minutes, every day', days: 10 }],
  },
  nutrition: {
    id: 'nutrition', name: 'Nutrition', short: 'Nutrition', icon: 'leaf', hue: '#5E9A2E', soft: '#ECF4E3', deep: '#2E4D15',
    pitch: 'Cook a little more, plan a little better, and stop starting over every Monday.',
    checkin: {
      question: 'How did eating go today?',
      options: [
        { v: 'off', label: 'Off track', hit: false },
        { v: 'okay', label: 'Mostly okay', hit: true },
        { v: 'great', label: 'Felt good', hit: true },
      ],
      hitLabel: 'good days',
    },
    whyIdeas: ['I rely on takeout too much', 'I want steady energy at work', 'My doctor nudged me'],
    successIdeas: ['Cook dinner four nights a week', 'Vegetables at two meals a day'],
    habits: [
      { id: 'plan-sunday', title: 'Sunday plan + shop', detail: 'Four dinners, one list' },
      { id: 'veg-two', title: 'Vegetables at two meals', detail: 'Frozen counts' },
      { id: 'water', title: 'Water bottle on your desk', detail: 'Refill at lunch' },
    ],
    challenges: [{ id: 'cook-4', title: 'Cook Four Nights', action: 'Make dinner at home', days: 7 }],
  },
  stress: {
    id: 'stress', name: 'Stress management', short: 'Stress', icon: 'wind', hue: '#3B8FD9', soft: '#E5F0FB', deep: '#14426B',
    pitch: 'Practical ways to come down from the day, with people who get the pressure.',
    checkin: {
      question: 'How was your stress today?',
      options: [
        { v: 'high', label: 'Overwhelmed', hit: false },
        { v: 'mid', label: 'Manageable', hit: true },
        { v: 'low', label: 'Calm', hit: true },
      ],
      hitLabel: 'manageable days',
    },
    whyIdeas: ['Work bleeds into everything', 'I snap at people I love', 'I want my weekends back'],
    successIdeas: ['A real lunch break, four days a week', 'Log off by 6 PM'],
    habits: [
      { id: 'walk-lunch', title: '15-minute walk at lunch', detail: 'No phone calls' },
      { id: 'shutdown', title: 'End-of-day shutdown', detail: 'Write tomorrow’s top three, close the laptop' },
      { id: 'box-breath', title: 'Box breathing', detail: '4 rounds when it spikes' },
    ],
    challenges: [{ id: 'shutdown-5', title: 'Shutdown Ritual Week', action: 'Close the laptop by 6 PM', days: 5 }],
  },
};

export const GOAL_LIST = Object.values(GOALS);
export const goal = (id) => GOALS[id] || GOALS.sleep;
