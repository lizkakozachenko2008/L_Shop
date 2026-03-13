export interface BadgeProps {
  count: number;
  className?: string;
}

export const Badge = ({ count, className = '' }: BadgeProps): HTMLElement => {
  const badge = document.createElement('span');
  badge.className = `badge ${className}`.trim();
  badge.textContent = count.toString();
  return badge;
};