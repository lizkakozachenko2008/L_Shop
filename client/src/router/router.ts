import { LoginPage } from "../pages/LoginPage";
import { HomePage } from "../pages/HomePage";
import { CartPage } from "../pages/CartPage";
import { CheckoutPage } from "../pages/CheckoutPage";
import { Header } from "../components/Header";

const routes: Record<string, () => HTMLElement> = {
  "/login": LoginPage,
  "/": HomePage,
  "/cart": CartPage,
  "/checkout": CheckoutPage,
};

const app = document.getElementById("app") as HTMLElement;

export const updateCartBadge = async () => {
  const badge = document.querySelector(".cart-badge") as HTMLElement | null;
  if (!badge) return;

  try {
    const res = await fetch("http://localhost:5000/api/cart", { 
      credentials: "include" 
    });
    
    if (!res.ok) {
      badge.textContent = "0";
      badge.style.display = "none"; // Гости не видят badge
      return;
    }

    const data = await res.json();
    const total = data.totalItems || 0;
    
    badge.textContent = total.toString();
    badge.style.display = total > 0 ? "flex" : "none";
    
  } catch {
    badge.textContent = "0";
    badge.style.display = "none"; // Ошибка = гости = нет badge
  }
};




const renderPage = async () => {
  const path = window.location.pathname || "/";
  const pageFn = routes[path] || (() => {
    const div = document.createElement("div");
    div.innerHTML = "<h2 style='text-align: center; margin-top: 100px; color: #666;'>404 - Страница не найдена</h2>";
    return div;
  });

  let header: HTMLElement;
  try {
    header = await Header();
  } catch (err) {
    console.error("Ошибка Header — fallback:", err);
    header = document.createElement("header");
    header.className = "header";
    header.innerHTML = `
      <div class="header-content container">
        <div class="header-left">
          <h1><a href="/" id="logo">Lunar Glow</a></h1>
        </div>
        <nav class="header-nav">
          <a href="/" id="home-link">Главная</a>
          <a href="/login" id="login-link">Вход / Регистрация</a>
          <a href="/cart" id="cart-link" class="cart-link">
            <svg class="cart-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="9" cy="21" r="1"/>
              <circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.7 13.5a2 2 0 0 0 2 1.5h10.6a2 2 0 0 0 2-1.5L23 4H6"/>
            </svg>
            <span class="cart-badge">0</span>
          </a>
        </nav>
      </div>
    `;
    header.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        navigate(link.getAttribute("href") || "/");
      });
    });
  }

  const main = document.createElement("main");
  main.className = "main-content";
  const pageElement = pageFn();

  app.innerHTML = "";
  app.appendChild(header);
  app.appendChild(main);
  main.appendChild(pageElement);

  await updateCartBadge(); // После DOM
};

export const navigate = async (path: string) => {
  history.pushState({}, "", path);
  await renderPage();
};

window.addEventListener("popstate", renderPage);
renderPage();
