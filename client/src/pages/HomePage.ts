import type { Product } from "../types/Product";
import { api, handleResponse } from "../services/api";
import { navigate, updateCartBadge } from "../router/router";

export const HomePage = (): HTMLElement => {
  const container = document.createElement("div");
  container.className = "home-page";

  container.innerHTML = `
  <div class="filters">
  <input type="text" id="search-input" placeholder="Поиск по названию">
  <select id="category-filter">
  <option value="">Все категории</option>
   </select>
   <select id="stock-filter">
    <option value="">Все</option>
    <option value="true">В наличии</option>
    <option value="false">Нет в наличии</option>
   </select>
   <select id="sort-filter">
    <option value="">Сортировка</option>
    <option value="price_asc">Цена ↑</option>
    <option value="price_desc">Цена ↓</option>
   </select>
 </div>
 <div class="products-grid" id="products-grid">
   <div style="text-align: center; padding: 80px; color: #666;">
    <div style="font-size: 4rem;">🛍️</div>
    <p>Загрузка товаров...</p>
   </div>
 </div>
 <div class="pagination" id="pagination"></div>
`;

  let currentPage = 1;
  const ITEMS_PER_PAGE = 9; // 3x3 = 9 карточек

  const loadProducts = async (page: number = 1) => {
   currentPage = page;
   
   const search = (container.querySelector("#search-input") as HTMLInputElement)?.value || "";
   const category = (container.querySelector("#category-filter") as HTMLSelectElement)?.value || "";
   const inStock = (container.querySelector("#stock-filter") as HTMLSelectElement)?.value || "";
   const sort = (container.querySelector("#sort-filter") as HTMLSelectElement)?.value || "";

   const params = new URLSearchParams({
   page: page.toString(),
   limit: ITEMS_PER_PAGE.toString()
   });
   
   if (search) params.append("search", search);
   if (category) params.append("category", category);
   if (inStock !== "") params.append("inStock", inStock);
   if (sort) params.append("sort", sort);

   try {
   const res = await api.products.get(params);
   const data = await handleResponse<{ products: Product[]; total: number; page: number; limit: number }>(res);

   const grid = container.querySelector("#products-grid") as HTMLElement;
   if (grid) grid.innerHTML = "";

   // Заполняем категории (один раз)
   const categorySelect = container.querySelector("#category-filter") as HTMLSelectElement;
   if (categorySelect && categorySelect.options.length === 1) {
     const categories = [...new Set(data.products.map(p => p.category))];
     categories.forEach(cat => {
      const option = document.createElement("option");
      option.value = cat;
      option.textContent = cat;
      categorySelect.appendChild(option);
     });
   }

   // Рендерим товары текущей страницы
   data.products.forEach(product => {
     const card = document.createElement("div");
     card.className = "product-card";
     card.innerHTML = `
      <h3 data-title>${product.title}</h3>
      <p data-price>${product.price.toFixed(2)} Br</p>
      <p>${product.description}</p>
      <p>Категория: ${product.category}</p>
      <p class="stock-info">В наличии: <strong>${product.stock}</strong> шт</p>
      <div class="add-to-cart">
       <input type="number" min="1" max="${product.stock}" value="1" class="quantity-input">
       <button class="add-btn">Добавить в корзину</button>
      </div>
     `;

     card.querySelector(".add-btn")?.addEventListener("click", async () => {
      const input = card.querySelector(".quantity-input") as HTMLInputElement;
      const quantity = parseInt(input.value) || 1;
      if (quantity > 0 && quantity <= product.stock) {
       try {
        await api.cart.add({ productId: product.id, quantity });
        await updateCartBadge(); 
        alert("✅ Добавлено в корзину! (счётчик обновлён)");
        // ❌ УБРАНО: navigate("/cart");
       } catch (err) {
        alert("Войдите в аккаунт для добавления в корзину");
        navigate("/login");
       }
      } else {
       alert("Неверное количество");
      }
     });

     if (grid) grid.appendChild(card);
   });

   // Рендерим пагинацию
   renderPagination(data.total, data.page, Math.ceil(data.total / ITEMS_PER_PAGE));

   } catch (err) {
   const grid = container.querySelector("#products-grid") as HTMLElement;
   if (grid) {
     grid.innerHTML = `
      <div style="text-align: center; padding: 80px; color: #666;">
       <div style="font-size: 4rem;">❌</div>
       <h3>Ошибка загрузки товаров</h3>
       <p>Попробуйте позже</p>
      </div>
     `;
   }
  }
  };

  const renderPagination = (total: number, current: number, totalPages: number) => {
   const pagination = container.querySelector("#pagination") as HTMLElement;
   if (!pagination) return;

   if (totalPages <= 1) {
   pagination.innerHTML = "";
   return;
   }

   let paginationHTML = `
   <div class="pagination-container">
     <button class="pagination-btn ${current === 1 ? 'disabled' : ''}" data-page="${current - 1}">‹ Предыдущая</button>
   `;

   const start = Math.max(1, current - 1);
   const end = Math.min(totalPages, current + 1);

   for (let i = start; i <= end; i++) {
   paginationHTML += `
     <button class="pagination-btn ${i === current ? 'active' : ''}" data-page="${i}">${i}</button>
   `;
   }

   paginationHTML += `
     <button class="pagination-btn ${current === totalPages ? 'disabled' : ''}" data-page="${current + 1}">Следующая ›</button>
     <span class="pagination-info">Страница ${current} из ${totalPages} (${total} товаров)</span>
   </div>
   `;

   pagination.innerHTML = paginationHTML;

   // Обработчики кнопок пагинации
   pagination.querySelectorAll(".pagination-btn").forEach(btn => {
   btn.addEventListener("click", (e: Event) => {
     e.preventDefault();
     const page = parseInt((btn as HTMLElement).dataset.page || "1");
     if (!isNaN(page) && page !== currentPage) {
      loadProducts(page);
     }
   });
   });
  };

  // Фильтры - сбрасываем на первую страницу
  container.querySelector("#search-input")?.addEventListener("input", () => loadProducts(1));
  container.querySelector("#category-filter")?.addEventListener("change", () => loadProducts(1));
  container.querySelector("#stock-filter")?.addEventListener("change", () => loadProducts(1));
  container.querySelector("#sort-filter")?.addEventListener("change", () => loadProducts(1));

  loadProducts(1); // первая загрузка

  return container;
};
