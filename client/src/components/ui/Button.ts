export interface ButtonProps {
  text: string;
  onClick?: (e: Event) => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  className?: string;
  href?: string; // если это ссылка
}

export const Button = ({
  text,
  onClick,
  variant = 'primary',
  size = 'medium',
  className = '',
  href
}: ButtonProps): HTMLElement => {
  const button = href ? document.createElement('a') : document.createElement('button');
  
  button.textContent = text;
  
  // Базовые классы
  const baseClass = 'btn';
  const variantClass = `btn-${variant}`;
  const sizeClass = `btn-${size}`;
  
  button.className = `${baseClass} ${variantClass} ${sizeClass} ${className}`.trim();
  
  if (href) {
    (button as HTMLAnchorElement).href = href;
  }
  
  if (onClick) {
    button.addEventListener('click', onClick);
  }
  
  return button;
};