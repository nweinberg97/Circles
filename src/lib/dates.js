export const DAY = 86400000;
const DOW = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const startOfDay = (d = new Date()) => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; };
export const key = (d = new Date()) => { const x = new Date(d); return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`; };
export const fromKey = (k) => { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d); };
export const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
export const daysAgo = (n) => addDays(startOfDay(), -n);
export const dayName = (i) => DOW[i];
export const shortDay = (i) => DOW[i].slice(0, 3);

/** Monday-start week containing d */
export function weekDays(d = new Date()) {
  const s = startOfDay(d);
  const offset = (s.getDay() + 6) % 7;
  const mon = addDays(s, -offset);
  return Array.from({ length: 7 }, (_, i) => addDays(mon, i));
}

/** Next occurrence of weekday (0=Sun) at hh:mm, from now. */
export function nextWeekday(dow, time = '10:00') {
  const [h, m] = time.split(':').map(Number);
  const now = new Date();
  const d = startOfDay(now);
  let diff = (dow - d.getDay() + 7) % 7;
  const cand = addDays(d, diff); cand.setHours(h, m, 0, 0);
  if (cand <= now) cand.setDate(cand.getDate() + 7);
  return cand;
}

export function fmtTime(t) {
  const [h, m] = t.split(':').map(Number);
  const ap = h >= 12 ? 'PM' : 'AM';
  const hh = ((h + 11) % 12) + 1;
  return m ? `${hh}:${String(m).padStart(2, '0')} ${ap}` : `${hh}:00 ${ap}`;
}

export function fmtDate(d, { weekday = true } = {}) {
  const x = new Date(d);
  return `${weekday ? DOW[x.getDay()].slice(0, 3) + ', ' : ''}${MON[x.getMonth()]} ${x.getDate()}`;
}

export function relDay(d) {
  const diff = Math.round((startOfDay(d) - startOfDay()) / DAY);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  if (diff === -1) return 'Yesterday';
  if (diff > 1 && diff < 7) return DOW[new Date(d).getDay()];
  return fmtDate(d);
}

export function ago(ts) {
  const s = Math.max(0, (Date.now() - ts) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  const d = Math.floor(s / 86400);
  return d === 1 ? 'yesterday' : `${d}d`;
}

export const hoursAgo = (h) => Date.now() - h * 3600000;

export function greeting() {
  const h = new Date().getHours();
  if (h < 5) return 'Up late';
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}
