const KEY_VISITED = 'vesak.visited';
const KEY_CLICKED = 'vesak.hint.clicked';
const KEY_DRAGGED = 'vesak.hint.dragged';

function readFlag(key: string): boolean {
  if (typeof window === 'undefined') return true;
  try {
    return window.localStorage.getItem(key) === 'true';
  } catch {
    return true;
  }
}

function writeFlag(key: string): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, 'true');
  } catch {
    // Storage blocked (private mode, quota, etc.) — fail silently.
  }
}

export function isFirstVisit(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.localStorage.getItem(KEY_VISITED) !== 'true';
  } catch {
    return false;
  }
}

export function markVisited(): void {
  writeFlag(KEY_VISITED);
}

export function hasClickedLantern(): boolean {
  return readFlag(KEY_CLICKED);
}

export function markClickedLantern(): void {
  writeFlag(KEY_CLICKED);
}

export function hasDragged(): boolean {
  return readFlag(KEY_DRAGGED);
}

export function markDragged(): void {
  writeFlag(KEY_DRAGGED);
}
