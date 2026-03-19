import { Button } from './ui/Button';
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
        this.userInfo = {
          name: data.user.name,
          isLoggedIn: true
        };
      } else {
        // Пользователь не авторизован - оставляем значения по умолчанию
        console.log('Пользователь не авторизован');
      }
    } catch (err) {
      // Обработка ошибки сети или других проблем
      console.error('Ошибка при получении информации о пользователе:', err);
      // Оставляем значения по умолчанию (Гость, false)
    }
  }

  private async fetchCartCount(): Promise<void> {
    // Если пользователь не авторизован, корзина пуста
    if (!this.userInfo.isLoggedIn) {
      this.cartCount = 0;
      return;
    }

    try {
      // Получаем реальное количество из корзины
      const res = await api.cart.get();
      if (res.ok) {
        const data = await handleResponse<Cart>(res);
        this.cartCount = data.totalItems || 0;
      } else {
        this.cartCount = 0;
      }
    } catch (err) {
      console.error('Ошибка при получении корзины:', err);
      this.cartCount = 0; // В случае ошибки показываем 0
    }
  }

  private renderLogo(): HTMLElement {
    const logo = document.createElement('h1');
    const link = document.createElement('a');
    link.href = '/';
    link.id = 'logo';
    link.textContent = 'Lunar Glow';
    link.addEventListener('click', (e) => {
      e.preventDefault();
      location.href = '/';
    });
    logo.appendChild(link);
    return logo;
  }

  private renderNav(): HTMLElement {
    const nav = document.createElement('nav');
    nav.className = 'header-nav';

    // Главная
    const homeLink = document.createElement('a');
    homeLink.className = 'btn btn-outline btn-small';
    homeLink.href = '/';
    homeLink.id = 'home-link';
    homeLink.textContent = 'Главная';
    homeLink.addEventListener('click', (e) => {
      e.preventDefault();
      location.href = '/';
    });

    // Авторизация
    const authSection = this.renderAuthSection();

    // Корзина
    const cartLink = this.renderCartLink();

    nav.append(homeLink, authSection, cartLink);
    return nav;
  }

  private renderAuthSection(): HTMLElement {
    const container = document.createElement('div');
    container.className = 'auth-section';

    if (this.userInfo.isLoggedIn) {
  const userSpan = document.createElement('span');
  userSpan.textContent = `Привет, ${this.userInfo.name}!`;
  userSpan.className = 'greeting';
      
          // создаём logout как <a> с теми же классами, что и homeLink
          const logoutLink = document.createElement('a');
          logoutLink.className = 'btn btn-outline btn-small';
          logoutLink.href = '#';
          logoutLink.id = 'logout-link';
          logoutLink.textContent = 'Выйти';
          logoutLink.addEventListener('click', async (e) => {
            e.preventDefault();
            try {
              await api.auth.logout();
              location.reload();
            } catch (err) {
              console.error('Ошибка при выходе:', err);
            }
          });

        container.append(userSpan, logoutLink);
    } else {
      const loginLink = Button({
        text: 'Вход / Регистрация',
        variant: 'outline',
        size: 'small',
        href: '/login'
      });
      loginLink.id = 'login-link';
      
      container.appendChild(loginLink);
    }

    return container;
  }

private renderCartLink(): HTMLElement {
  const cartLink = document.createElement('a');
  cartLink.href = '/cart';
  cartLink.className = 'cart-link';
  cartLink.id = 'cart-link';
  
  // Создаем иконку
  const icon = Icon({ name: 'cart', size: 24 });
  
  // Создаем контейнер для бейджа (чтобы он не прыгал)
  const badgeContainer = document.createElement('span');
  badgeContainer.className = 'badge-container';
  
  if (this.cartCount > 0) {
    const badge = Badge({ count: this.cartCount });
    badgeContainer.appendChild(badge);
  }

  cartLink.append(icon, badgeContainer); // Используем append, а не innerHTML
  
  cartLink.addEventListener('click', (e) => {
    e.preventDefault();
    // Используйте ваш роутер здесь, если он есть, вместо location.href
    location.href = '/cart';
  });

  return cartLink;
}

  private renderLeftSection(): HTMLElement {
    const left = document.createElement('div');
    left.className = 'header-left';
    left.appendChild(this.renderLogo());
    return left;
  }

  public async render(): Promise<HTMLElement> {
    // Сначала получаем информацию о пользователе
    await this.fetchUserInfo();
    
    // Потом получаем корзину (учитывая авторизацию)
    await this.fetchCartCount();

    const container = document.createElement('div');
    container.className = 'header-content container';
    
    container.appendChild(this.renderLeftSection());
    container.appendChild(this.renderNav());
    
    this.header.innerHTML = ''; // очищаем
    this.header.appendChild(container);
    
    return this.header;
  }

  // Метод для обновления счетчика корзины (можно вызвать извне)
  public async updateCartCount(): Promise<void> {
    await this.fetchCartCount();
    this.updateCartBadge();
  }

  private updateCartBadge(): void {
    const cartLink = this.header.querySelector('#cart-link');
    if (cartLink) {
      const oldBadge = cartLink.querySelector('.badge');
      if (oldBadge) oldBadge.remove();
      
      const newBadge = Badge({ count: this.cartCount });
      cartLink.appendChild(newBadge);
    }
  }
}