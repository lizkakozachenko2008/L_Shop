import type { IconProps } from './Icon.types';

export const Icon = ({ name, size = 24, className = '' }: IconProps): SVGElement => {
  const svgNS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(svgNS, 'svg');
  
  // Базовые атрибуты SVG
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('width', size.toString());
  svg.setAttribute('height', size.toString());
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', 'currentColor');
  svg.setAttribute('stroke-width', '2');
  svg.setAttribute('stroke-linecap', 'round');
  svg.setAttribute('stroke-linejoin', 'round');

  // БЕЗОПАСНАЯ ОБРАБОТКА КЛАССОВ (Фикс SyntaxError)
  const classList = ['icon-svg'];
  if (typeof className === 'string' && className.trim()) {
    classList.push(...className.trim().split(/\s+/));
  } else if (Array.isArray(className)) {
    classList.push(...className.filter(Boolean));
  }
  
  // Используем setAttribute, он никогда не падает от пустых строк
  svg.setAttribute('class', classList.join(' '));
  // Sprite loading/cache (loaded once)
  let spriteDoc: Document | null = (window as any).__ICON_SPRITE_DOC__ || null;
  let spritePromise: Promise<void> | null = (window as any).__ICON_SPRITE_PROMISE__ || null;

  const ensureSprite = (): Promise<void> => {
    if (spriteDoc) return Promise.resolve();
    if (spritePromise) return spritePromise;
    spritePromise = fetch('/vite.svg')
      .then((res) => res.text())
      .then((text) => {
        const doc = new DOMParser().parseFromString(text, 'image/svg+xml');
        spriteDoc = doc;
        (window as any).__ICON_SPRITE_DOC__ = doc;
      }).catch(() => {
        // ignore failures — we'll fallback to inline builds
      }).finally(() => { (window as any).__ICON_SPRITE_PROMISE__ = null; });
    (window as any).__ICON_SPRITE_PROMISE__ = spritePromise;
    return spritePromise;
  };

  const clearChildren = () => {
    while (svg.firstChild) svg.removeChild(svg.firstChild);
  };

  const buildInline = () => {
    clearChildren();
    if (name === 'cart') {
      const c1 = document.createElementNS(svgNS, 'circle'); c1.setAttribute('cx', '9'); c1.setAttribute('cy', '21'); c1.setAttribute('r', '1');
      const c2 = document.createElementNS(svgNS, 'circle'); c2.setAttribute('cx', '20'); c2.setAttribute('cy', '21'); c2.setAttribute('r', '1');
      const path = document.createElementNS(svgNS, 'path'); path.setAttribute('d', 'M1 1h4l2.7 13.5a2 2 0 0 0 2 1.5h10.6a2 2 0 0 0 2-1.5L23 4H6');
      svg.appendChild(c1); svg.appendChild(c2); svg.appendChild(path);
      return;
    }
    if (name === 'user') {
      const path = document.createElementNS(svgNS, 'path'); path.setAttribute('d', 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2');
      const circle = document.createElementNS(svgNS, 'circle'); circle.setAttribute('cx', '12'); circle.setAttribute('cy', '7'); circle.setAttribute('r', '4');
      svg.appendChild(path); svg.appendChild(circle);
      return;
    }
    if (name === 'home') {
      const path = document.createElementNS(svgNS, 'path'); path.setAttribute('d', 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z');
      const poly = document.createElementNS(svgNS, 'polyline'); poly.setAttribute('points', '9 22 9 12 15 12 15 22');
      svg.appendChild(path); svg.appendChild(poly);
      return;
    }
    if (name === 'logout') {
      const path = document.createElementNS(svgNS, 'path'); path.setAttribute('d', 'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4');
      const poly = document.createElementNS(svgNS, 'polyline'); poly.setAttribute('points', '16 17 21 12 16 7');
      const line = document.createElementNS(svgNS, 'line'); line.setAttribute('x1', '21'); line.setAttribute('y1', '12'); line.setAttribute('x2', '9'); line.setAttribute('y2', '12');
      svg.appendChild(path); svg.appendChild(poly); svg.appendChild(line);
      return;
    }
  };

  const populateFromSprite = () => {
    try {
      if (!spriteDoc) return false;
      // Try several selectors to find a matching element
      const trySelectors = [
        `#${name}`,
        `symbol#${name}`,
        `svg#${name}`,
        `[id="icon-${name}"]`,
        `[id="icn-${name}"]`
      ];
      let found: Element | null = null;
      for (const sel of trySelectors) {
        found = spriteDoc.querySelector(sel);
        if (found) break;
      }
      if (!found) return false;

      clearChildren();
      // If it's a <symbol> or <svg>, clone its children into our svg
      if (found.tagName.toLowerCase() === 'symbol' || found.tagName.toLowerCase() === 'svg') {
        const children = Array.from(found.childNodes) as Node[];
        for (const ch of children) {
          const imported = document.importNode(ch, true) as Node;
          svg.appendChild(imported);
        }
        return true;
      }

      // Otherwise, clone the element itself
      const imported = document.importNode(found, true) as Node;
      svg.appendChild(imported);
      return true;
    } catch (e) {
      return false;
    }
  };

  // First try: if sprite already loaded, populate synchronously
  spriteDoc = (window as any).__ICON_SPRITE_DOC__ || spriteDoc;
  if (spriteDoc && populateFromSprite()) {
    return svg;
  }

  // Otherwise, start loading sprite in background and populate when ready; fallback to inline build if sprite missing
  ensureSprite().then(() => {
    spriteDoc = (window as any).__ICON_SPRITE_DOC__ || spriteDoc;
    if (!populateFromSprite()) {
      buildInline();
    }
  }).catch(() => {
    // load failed — fallback inline
    buildInline();
  });

  return svg;
};