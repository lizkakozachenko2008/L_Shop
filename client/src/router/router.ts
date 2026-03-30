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
    // Header is a class — construct it and call render()
    const headerInstance = new Header();
    header = await headerInstance.render();
  } catch (err) {
    console.error("Ошибка Header — fallback:", err);
    // Use Header.createFallback() to provide a safe fallback header
    header = Header.createFallback();
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
