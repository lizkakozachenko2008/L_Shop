export type IconName = 'cart' | 'user' | 'home' | 'logout';

export interface IconProps {
  name: IconName;
  size?: number;
  className?: string | string[];
}
