import type { Product } from "../types/Product";
import { api, handleResponse } from "../services/api";
import { navigate, updateCartBadge } from "../router/router";

export const HomePage = (): HTMLElement => {
  const container = document.createElement("div");
  container.className = "home-page";

  let currentPage = 1;
  const ITEMS_PER_PAGE = 9;

  const filtersDiv = document.createElement("div");
  filtersDiv.className = "filters";

  const searchInput = document.createElement("input");
  searchInput.type = "text";
  searchInput.id = "search-input";
  searchInput.placeholder = "Поиск по названию";

  const categoryFilter = document.createElement("select");
  categoryFilter.id = "category-filter";
  categoryFilter.add(new Option("Все категории", ""));

  const stockFilter = document.createElement("select");
  stockFilter.id = "stock-filter";
  stockFilter.add(new Option("Все", ""));
  stockFilter.add(new Option("В наличии", "true"));
  stockFilter.add(new Option("Нет в наличии", "false"));

  const sortFilter = document.createElement("select");
  sortFilter.id = "sort-filter";
  sortFilter.add(new Option("Сортировка", ""));
  sortFilter.add(new Option("Цена ↑", "price_asc"));
  sortFilter.add(new Option("Цена ↓", "price_desc"));

  filtersDiv.append(searchInput, categoryFilter, stockFilter, sortFilter);

  const productsGrid = document.createElement("div");
  productsGrid.className = "products-grid";
  productsGrid.id = "products-grid";

  const paginationDiv = document.createElement("div");
  paginationDiv.className = "pagination";
  paginationDiv.id = "pagination";

  container.append(filtersDiv, productsGrid, paginationDiv);


  const loadProducts = async (page: number = 1) => {
    currentPage = page;

    productsGrid.replaceChildren();
    const loader = document.createElement("div");
    loader.style.cssText = "text-align: center; padding: 80px; color: #666;";
    const loaderIcon = document.createElement("div");
    loaderIcon.style.fontSize = "4rem";
    loaderIcon.textContent = "🛍️";
    const loaderText = document.createElement("p");
    loaderText.textContent = "Загрузка товаров...";
    loader.append(loaderIcon, loaderText);
    productsGrid.append(loader);

    const params = new URLSearchParams({
      page: currentPage.toString(),
      limit: ITEMS_PER_PAGE.toString()
    });

    if (searchInput.value) params.append("search", searchInput.value);
    if (categoryFilter.value) params.append("category", categoryFilter.value);
    if (stockFilter.value !== "") params.append("inStock", stockFilter.value);
    if (sortFilter.value) params.append("sort", sortFilter.value);

    try {
      const res = await api.products.get(params);
      const data = await handleResponse<{ products: Product[]; total: number; page: number; limit: number }>(res);

      productsGrid.replaceChildren();
      if (categoryFilter.options.length === 1) {
        const categories = [...new Set(data.products.map(p => p.category))];
        categories.forEach(cat => categoryFilter.add(new Option(cat, cat)));
      }

      data.products.forEach(product => {
        const card = document.createElement("div");
        card.className = "product-card";

        const h3 = document.createElement("h3");
        h3.textContent = product.title;

        const price = document.createElement("p");
        price.textContent = `${product.price.toFixed(2)} Br`;

        const desc = document.createElement("p");
        desc.textContent = product.description;

        const cat = document.createElement("p");
        cat.textContent = `Категория: ${product.category}`;

        const stock = document.createElement("p");
        stock.className = "stock-info";
        stock.innerHTML = `В наличии: <strong>${product.stock}</strong> шт`;

        const addToCartDiv = document.createElement("div");
        addToCartDiv.className = "add-to-cart";

        const qtyInput = document.createElement("input");
        qtyInput.type = "number";
        qtyInput.min = "1";
        qtyInput.max = product.stock.toString();
        qtyInput.value = "1";
        qtyInput.className = "quantity-input";

        const addBtn = document.createElement("button");
        addBtn.className = "add-btn";
        addBtn.textContent = "Добавить в корзину";

        addBtn.onclick = async () => {
          const quantity = parseInt(qtyInput.value) || 1;
          if (quantity > 0 && quantity <= product.stock) {
            try {
              await api.cart.add({ productId: product.id, quantity });
              await updateCartBadge();
              alert("✅ Добавлено в корзину!");
            } catch {
              alert("Войдите в аккаунт");
              navigate("/login");
            }
          } else {
            alert("Неверное количество");
          }
        };

        addToCartDiv.append(qtyInput, addBtn);
        card.append(h3, price, desc, cat, stock, addToCartDiv);
        productsGrid.append(card);
      });

      renderPagination(data.total, currentPage, Math.ceil(data.total / ITEMS_PER_PAGE));

    } catch (err) {
      productsGrid.replaceChildren();
      const errBox = document.createElement("h3");
      errBox.textContent = "❌ Ошибка загрузки";
      productsGrid.append(errBox);
    }
  };

  const renderPagination = (total: number, current: number, totalPages: number) => {
    paginationDiv.replaceChildren();
    if (totalPages <= 1) return;

    const nav = document.createElement("div");
    nav.className = "pagination-container";

    const createBtn = (text: string, page: number, isDisabled: boolean, isActive: boolean = false) => {
      const btn = document.createElement("button");
      btn.className = `pagination-btn ${isActive ? 'active' : ''} ${isDisabled ? 'disabled' : ''}`;
      btn.textContent = text;
      
      if (!isDisabled && page !== current) {
        btn.onclick = (e) => {
          e.preventDefault();
          loadProducts(page);
          filtersDiv.scrollIntoView({ behavior: 'smooth' });
        };
      }
      return btn;
    };

    nav.append(createBtn("‹ Предыдущая", current - 1, current === 1));

    const start = Math.max(1, current - 1);
    const end = Math.min(totalPages, current + 1);

    for (let i = start; i <= end; i++) {
      nav.append(createBtn(i.toString(), i, false, i === current));
    }

    nav.append(createBtn("Следующая ›", current + 1, current === totalPages));

    const info = document.createElement("span");
    info.className = "pagination-info";
    info.textContent = `Страница ${current} из ${totalPages} (${total} товаров)`;
    nav.append(info);

    paginationDiv.append(nav);
  };

  searchInput.oninput = () => loadProducts(1);
  categoryFilter.onchange = () => loadProducts(1);
  stockFilter.onchange = () => loadProducts(1);
  sortFilter.onchange = () => loadProducts(1);

  loadProducts(1);

  return container;
};