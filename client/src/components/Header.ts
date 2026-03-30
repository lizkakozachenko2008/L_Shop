import { Icon } from './ui/Icon';
import { Badge } from './ui/Badge';
import { api, handleResponse } from "../services/api";
import type { Cart } from "../types/Cart";

interface UserInfo {
  name: string;
  isLoggedIn: boolean;
}

export class Header {
  private header: HTMLElement;
  private userInfo: UserInfo = { name: 'Гость', isLoggedIn: false };
  private cartCount: number = 0;

  constructor() {
    this.header = document.createElement('header');
    this.header.className = 'header';
  }

  private async fetchUserInfo(): Promise<void> {
    try {
      const res = await api.auth.me();
      if (res.ok) {
        const data = await handleResponse<{ user: { name: string } }>(res);
        this.userInfo = { name: data.user.name, isLoggedIn: true };
      }
    } catch (err) { this.userInfo = { name: 'Гость', isLoggedIn: false }; }
  }

  private async fetchCartCount(): Promise<void> {
    if (!this.userInfo.isLoggedIn) { this.cartCount = 0; return; }
    try {
      const res = await api.cart.get();
      if (res.ok) {
        const data = await handleResponse<Cart>(res);
        this.cartCount = data.totalItems || 0;
      }
    } catch (err) { this.cartCount = 0; }
  }

  private renderLogo(): HTMLElement {
    const div = document.createElement('div');
    div.className = 'header-left';
    const h1 = document.createElement('h1');
    const a = document.createElement('a');
    a.href = '/';
    a.textContent = 'Lunar Glow';
    a.onclick = (e) => { e.preventDefault(); location.href = '/'; };
    h1.appendChild(a);
    div.appendChild(h1);
    return div;
  }

  private renderAuthSection(): HTMLElement {
    const container = document.createElement('div');
    container.className = 'auth-section';

    if (this.userInfo.isLoggedIn) {
      const span = document.createElement('span');
      span.className = 'user-name';
      span.style.marginRight = '15px';
      span.textContent = `Привет, ${this.userInfo.name}!`;

      const logoutA = document.createElement('a');
      logoutA.className = 'btn btn-outline btn-small';
      logoutA.href = '/';
      logoutA.style.display = 'inline-flex';
      logoutA.style.alignItems = 'center';

      const icon = Icon({ name: 'logout', size: 16 });
      icon.style.marginRight = '8px';
      
      logoutA.append(icon, document.createTextNode('Выйти'));
      logoutA.onclick = async (e) => {
        e.preventDefault();
        await api.auth.logout();
        location.reload();
      };

      container.append(span, logoutA);
    } else {
      const loginA = document.createElement('a');
      loginA.className = 'btn btn-outline btn-small';
      loginA.href = '/login';
      loginA.textContent = 'Вход / Регистрация';
      container.appendChild(loginA);
    }
    return container;
  }

  private renderCartLink(): HTMLElement {
    const a = document.createElement('a');
    a.href = '/cart';
    a.className = 'cart-link';
    a.id = 'cart-link';

    const icon = Icon({ name: 'cart', size: 24, className: 'cart-svg' });
    const b = Badge({ count: this.cartCount });
    b.className = 'cart-badge'; 

    a.append(icon, b);
    a.onclick = (e) => { e.preventDefault(); location.href = '/cart'; };
    return a;
  }

  public async render(): Promise<HTMLElement> {
    await this.fetchUserInfo();
    await this.fetchCartCount();

    const container = document.createElement('div');
    container.className = 'header-content container';

    const nav = document.createElement('nav');
    nav.className = 'header-nav';

   
    const homeA = document.createElement('a');
    homeA.className = 'btn btn-outline btn-small';
    homeA.href = '/';
    homeA.textContent = 'Главная';

    nav.append(homeA, this.renderAuthSection(), this.renderCartLink());
    
    container.append(this.renderLogo(), nav);
    this.header.innerHTML = '';
    this.header.appendChild(container);

    return this.header;
  }

  public async updateCartCount(): Promise<void> {
    await this.fetchCartCount();
    const link = this.header.querySelector('#cart-link');
    if (link) {
      const old = link.querySelector('.cart-badge');
      if (old) old.remove();
      const b = Badge({ count: this.cartCount });
      b.className = 'cart-badge';
      link.appendChild(b);
    }
  }

 
  public static createFallback(): HTMLElement {
    const header = document.createElement('header');
    header.className = 'header';

    const container = document.createElement('div');
    container.className = 'header-content container';

    const left = document.createElement('div');
    left.className = 'header-left';
    const h1 = document.createElement('h1');
    const logo = document.createElement('a');
    logo.href = '/';
    logo.id = 'logo';
    logo.textContent = 'Lunar Glow';
    logo.addEventListener('click', (e) => { e.preventDefault(); location.href = '/'; });
    h1.appendChild(logo);
    left.appendChild(h1);

    const nav = document.createElement('nav');
    nav.className = 'header-nav';

    const home = document.createElement('a');
    home.href = '/';
    home.id = 'home-link';
    home.textContent = 'Главная';
    home.addEventListener('click', (e) => { e.preventDefault(); location.href = '/'; });

    const login = document.createElement('a');
    login.href = '/login';
    login.id = 'login-link';
    login.textContent = 'Вход / Регистрация';
    login.addEventListener('click', (e) => { e.preventDefault(); location.href = '/login'; });

    const cart = document.createElement('a');
    cart.href = '/cart';
    cart.id = 'cart-link';
    cart.className = 'cart-link';
    cart.addEventListener('click', (e) => { e.preventDefault(); location.href = '/cart'; });

    const svgNS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('class', 'cart-svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '2');
    const c1 = document.createElementNS(svgNS, 'circle'); c1.setAttribute('cx','9'); c1.setAttribute('cy','21'); c1.setAttribute('r','1');
    const c2 = document.createElementNS(svgNS, 'circle'); c2.setAttribute('cx','20'); c2.setAttribute('cy','21'); c2.setAttribute('r','1');
    const path = document.createElementNS(svgNS, 'path'); path.setAttribute('d','M1 1h4l2.7 13.5a2 2 0 0 0 2 1.5h10.6a2 2 0 0 0 2-1.5L23 4H6');
    svg.appendChild(c1); svg.appendChild(c2); svg.appendChild(path);

    const badge = document.createElement('span'); badge.className = 'cart-badge'; badge.textContent = '0';
    cart.appendChild(svg); cart.appendChild(badge);

    nav.appendChild(home); nav.appendChild(login); nav.appendChild(cart);
    container.appendChild(left); container.appendChild(nav);
    header.appendChild(container);

    return header;
  }
}