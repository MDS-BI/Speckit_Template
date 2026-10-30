import { boot } from './app.js';
import { setActiveConfig, normalizeConfig } from './module-config.js';

try {
  // try to load module-config if exists
  const mod = await import('./module-config.js').catch(() => null);
} catch (e) {}

setActiveConfig(null);
boot();
