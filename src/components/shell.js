import { monogram } from '../utils.js';

const NAV_MODULES = ['dashboard', 'entities', 'documents', 'search'];

function renderLogo(container, moduleName) {
  if (!container) return;
  container.textContent = '';
  const namespace = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(namespace, 'svg');
  svg.setAttribute('viewBox', '0 0 40 40');
  svg.setAttribute('width', '40');
  svg.setAttribute('height', '40');
  svg.setAttribute('aria-hidden', 'true');
  svg.classList.add('brand-logo-svg');

  const circle = document.createElementNS(namespace, 'circle');
  circle.setAttribute('cx', '20');
  circle.setAttribute('cy', '20');
  circle.setAttribute('r', '20');
  circle.style.fill = 'var(--accent-color)';

  const text = document.createElementNS(namespace, 'text');
  text.setAttribute('x', '20');
  text.setAttribute('y', '26');
  text.setAttribute('text-anchor', 'middle');
  text.setAttribute('font-size', '16');
  text.setAttribute('font-weight', '700');
  text.setAttribute('fill', '#ffffff');
  text.textContent = monogram(moduleName);

  svg.append(circle, text);
  container.append(svg);
}

function navLabel(config, module) {
  const labels = config.labels || {};
  if (module === 'dashboard') return labels.dashboard || 'Panel';
  if (module === 'entities') return labels.entities || 'Entidades';
  if (module === 'documents') return labels.documents || 'Documentos';
  return labels.search || 'Buscar';
}

export function createShell({ config, onNavigate }) {
  const brandName = document.getElementById('brand-name');
  const brandLogo = document.getElementById('brand-logo');

  if (brandName) brandName.textContent = config.moduleName;
  renderLogo(brandLogo, config.moduleName);

  const buttons = NAV_MODULES.map((module) => {
    const button = document.getElementById(`nav-${module}`);
    if (button) {
      button.textContent = navLabel(config, module);
      button.setAttribute('aria-label', navLabel(config, module));
      button.onclick = () => onNavigate(module);
    }
    return button;
  }).filter(Boolean);

  function setActive(module) {
    for (const button of buttons) {
      const isActive = button.dataset.module === module;
      button.classList.toggle('active', isActive);
      if (isActive) {
        button.setAttribute('aria-current', 'page');
      } else {
        button.removeAttribute('aria-current');
      }
    }
  }

  return { setActive };
}
