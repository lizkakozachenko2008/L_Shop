export interface ButtonProps {
  text?: string;
  children?: any;
  onClick?: (e: Event) => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large' | 'icon';
  className?: string;
  href?: string;
  id?: string;        // Добавили для поиска в DOM
  ariaLabel?: string; // Добавили для доступности (ошибка 2339)
  type?: 'button' | 'submit' | 'reset';
}

export const Button = ({
  text,
  children,
  onClick,
  variant = 'primary',
  size = 'medium',
  className = '',
  href,
  id,
  ariaLabel,
  type = 'button'
}: ButtonProps): HTMLElement => {
  const el = href ? document.createElement('a') : document.createElement('button');
  
  if (id) el.id = id;
  if (ariaLabel) el.setAttribute('aria-label', ariaLabel);
  if (href) (el as HTMLAnchorElement).href = href;
  if (!href) (el as HTMLButtonElement).type = type;

  el.className = `btn btn-${variant} btn-${size} ${className}`.trim();

  // Рендерим текст или дочерние элементы
  if (children) {
    if (children instanceof Node) el.appendChild(children);
    else el.append(children);
  } else if (text) {
    el.textContent = text;
  }

  if (onClick) {
    el.addEventListener('click', onClick);
  }

  return el;
};