import { api, handleResponse } from "../services/api";

export const Header = async (): Promise<HTMLElement> => {
  const header = document.createElement("header");
  header.className = "header";

  let userName = "Гость";
  let isLoggedIn = false;
  let cartCount = 0; // TODO: потом реальный счётчик из /cart

  try {
    const res = await api.auth.me();
    if (res.ok) {
      const data = await handleResponse<{ user: { name: string } }>(res);
      userName = data.user.name;
      isLoggedIn = true;
    }
  } catch (err) {
    // не авторизован
  }

  header.innerHTML = `
    <div class="header-content container">
      <div class="header-left">
        <h1><a href="/" id="logo">Lunar Glow</a></h1>
      </div>
      <nav class="header-nav">
        <a href="/" id="home-link">Главная</a>
        ${isLoggedIn 
          ? `<span>Привет, ${userName}!</span> <a href="#" id="logout-link">Выйти</a>`
          : `<a href="/login" id="login-link">Вход / Регистрация</a>`
        }
        <a href="/cart" id="cart-link" class="cart-link">
          <svg class="cart-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="9" cy="21" r="1"/>
            <circle cx="20" cy="21" r="1"/>
            <path d="M1 1h4l2.7 13.5a2 2 0 0 0 2 1.5h10.6a2 2 0 0 0 2-1.5L23 4H6"/>
          </svg>
          <span class="cart-badge">${cartCount}</span>
        </a>
      </nav>
    </div>
  `;

  // Ссылки (временный location.href, потом роутер)
  header.querySelector("#logo")?.addEventListener("click", (e) => {
    e.preventDefault();
    location.href = "/";
  });

  header.querySelector("#home-link")?.addEventListener("click", (e) => {
    e.preventDefault();
    location.href = "/";
  });

  header.querySelector("#cart-link")?.addEventListener("click", (e) => {
    e.preventDefault();
    location.href = "/cart";
  });

  if (isLoggedIn) {
    header.querySelector("#logout-link")?.addEventListener("click", async (e) => {
      e.preventDefault();
      await api.auth.logout();
      location.reload();
    });
  } else {
    header.querySelector("#login-link")?.addEventListener("click", (e) => {
      e.preventDefault();
      location.href = "/login";
    });
  }

  return header;
};