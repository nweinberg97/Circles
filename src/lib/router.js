let renderer = () => {};
export const setRenderer = (fn) => { renderer = fn; };
export const rerender = () => renderer();

export function route() {
  const h = location.hash.replace(/^#/, '') || '/';
  const parts = h.split('?')[0].split('/').filter(Boolean);
  return { path: h, parts };
}

export function go(path) {
  if (location.hash === `#${path}`) renderer();
  else location.hash = path;
}

export const isActive = (section, name) => section === name;
