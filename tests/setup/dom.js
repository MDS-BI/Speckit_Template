import { beforeEach } from 'vitest';

beforeEach(() => {
  if (typeof localStorage !== 'undefined') localStorage.clear();
  if (typeof document !== 'undefined') {
    document.body.innerHTML = '';
    document.documentElement.removeAttribute('style');
    document.title = '';
  }
});
