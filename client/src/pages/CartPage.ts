import type { Product } from "../types/Product";
import { api, handleResponse } from "../services/api";
import { navigate } from "../router/router";

export const CartPage = (): HTMLElement => {
  const container = document.createElement("div");
  container.className = "cart-page";

  let selectedItems: string[] = JSON.parse(localStorage.getItem("cartSelectedItems") || "[]");
  let cartData: { items: { product: Product; quantity: number }[] } = { items: [] };
  let handlersSetup = false;

  const updateTotal = () => {
    const selected = cartData.items.filter(item => selectedItems.includes(item.product.id.toString()));
    const total = selected.reduce((sum: number, item) => sum + item.product.price * item.quantity, 0);

    const totalEl = container.querySelector("#cart-total") as HTMLElement;
    const countEl = container.querySelector("#selected-count") as HTMLElement;
    const checkoutBtn = container.querySelector("#checkout-btn") as HTMLButtonElement;
    const deleteSelectedBtn = container.querySelector("#delete-selected") as HTMLButtonElement;

    if (totalEl) totalEl.textContent = `${total.toFixed(2)} Br`;
    if (countEl) countEl.textContent = `${selected.length}`;
    if (checkoutBtn) checkoutBtn.disabled = selected.length === 0;
    if (deleteSelectedBtn) deleteSelectedBtn.disabled = selected.length === 0;

    localStorage.setItem("cartSelectedItems", JSON.stringify(selectedItems));
  };

  // UI
  container.innerHTML = `
    <div class="cart-header">
      <h2>🛒 Корзина</h2>
      <div class="cart-actions">
        <label class="select-all">
          <input type="checkbox" id="select-all"> Выбрать все
        </label>
        <button id="delete-selected" class="delete-selected-btn" disabled>Удалить выбранные</button>
      </div>
    </div>
    
    <div class="cart-layout">
      <div class="cart-items-section">
        <div class="cart-items" id="cart-items">
          <div style="text-align: center; padding: 80px; color: #666;">
            <div style="font-size: 4rem;">🛒</div>
            <p>Загрузка корзины...</p>
          </div>
        </div>
      </div>
      
      <div class="cart-summary">
        <div class="total-section">
          <div class="total-row">
            <span>Выбрано товаров:</span>
            <span id="selected-count">0</span>
          </div>
          <div class="total-row">
            <span>Итого:</span>
            <span id="cart-total" class="grand-total">0 Br</span>
          </div>
          <button id="checkout-btn" class="checkout-btn-large" disabled>Оформить заказ</button>
        </div>
      </div>
    </div>
  `;

  const renderItems = (items: { product: Product; quantity: number }[]) => {
    const itemsContainer = container.querySelector("#cart-items") as HTMLElement;
    if (!itemsContainer) return;

    itemsContainer.innerHTML = "";

    if (items.length === 0) {
      itemsContainer.innerHTML = `
        <div style="text-align: center; padding: 80px 20px; color: #666;">
          <div style="font-size: 4rem; margin-bottom: 20px;">🛒</div>
          <h3>Корзина пуста</h3>
          <p>Добавьте товары из каталога</p>
          <a href="/" style="color: #a78bfa; text-decoration: underline; font-size: 18px;">На главную</a>
        </div>
      `;
      updateTotal();
      return;
    }

    items.forEach(item => {
      const card = document.createElement("div");
      card.className = "cart-item";
      card.setAttribute("data-product-id", item.product.id.toString());

      const productId = item.product.id.toString();
      const isSelected = selectedItems.includes(productId);

      card.innerHTML = `
        <label class="item-checkbox">
          <input type="checkbox" class="item-select" data-product-id="${productId}" ${isSelected ? 'checked' : ''}>
        </label>
        <div class="item-info">
          <h3 data-title="basket">${item.product.title}</h3>
          <p data-price="basket">${item.product.price.toFixed(2)} Br</p>
          <p style="color: #666; font-size: 0.9rem; margin-bottom: 8px;">
            В наличии: ${item.product.stock} шт
          </p>
        </div>
        <div class="quantity-controls" data-product-id="${productId}">
          <button class="qty-btn minus-btn" data-product-id="${productId}">-</button>
          <span class="quantity" data-product-id="${productId}">${item.quantity}</span>
          <button class="qty-btn plus-btn" data-product-id="${productId}">+</button>
        </div>
        <div class="item-total-price" data-price="basket">
          ${(item.product.price * item.quantity).toFixed(2)} Br
        </div>
        <button class="remove-btn" data-product-id="${productId}">×</button>
      `;

      itemsContainer.appendChild(card);
    });
  };

  const setupEventHandlers = () => {
    if (handlersSetup) return;
    handlersSetup = true;

    // Выбрать все
    const selectAll = container.querySelector("#select-all") as HTMLInputElement;
    selectAll?.addEventListener("change", (e: Event) => {
      const checkboxes = container.querySelectorAll(".item-select") as NodeListOf<HTMLInputElement>;
      selectedItems = [];
      checkboxes.forEach(cb => {
        cb.checked = (e.target as HTMLInputElement).checked;
        if (cb.checked) selectedItems.push(cb.dataset.productId!);
      });
      updateTotal();
    });

    // Чекбоксы товаров
    container.querySelectorAll(".item-select").forEach((checkbox: Element) => {
      (checkbox as HTMLInputElement).addEventListener("change", () => {
        const id = (checkbox as HTMLInputElement).dataset.productId!;
        if ((checkbox as HTMLInputElement).checked) {
          if (!selectedItems.includes(id)) selectedItems.push(id);
        } else {
          selectedItems = selectedItems.filter(i => i !== id);
        }
        updateTotal();

        const allChecked = Array.from(container.querySelectorAll(".item-select"))
          .every(cb => (cb as HTMLInputElement).checked);
        if (selectAll) selectAll.checked = allChecked && cartData.items.length > 0;
      });
    });

    // Кнопки количества
    container.querySelectorAll(".qty-btn").forEach((btn: Element) => {
      (btn as HTMLButtonElement).addEventListener("click", async () => {
        const productId = (btn as HTMLButtonElement).dataset.productId!;
        const item = cartData.items.find(i => i.product.id.toString() === productId);
        if (!item) return;

        const isPlus = btn.classList.contains("plus-btn");
        let newQty = item.quantity + (isPlus ? 1 : -1);
        if (newQty < 1) newQty = 1;
        if (newQty > item.product.stock) newQty = item.product.stock;

        await api.cart.update(item.product.id, newQty);
        navigate("/cart"); // обновит header (новый fetch count) и страницу
      });
    });

    // Удаление одной позиции
    container.querySelectorAll(".remove-btn").forEach((btn: Element) => {
      (btn as HTMLButtonElement).addEventListener("click", async () => {
        const productId = (btn as HTMLButtonElement).dataset.productId!;
        selectedItems = selectedItems.filter(id => id !== productId);
        await api.cart.remove(productId);
        navigate("/cart"); // обновит header и страницу
      });
    });

    // Удалить выбранные
    const deleteSelectedBtn = container.querySelector("#delete-selected") as HTMLButtonElement;
    if (deleteSelectedBtn) {
      deleteSelectedBtn.addEventListener("click", async () => {
        if (selectedItems.length === 0) return;

        for (const id of selectedItems) {
          await api.cart.remove(id);
        }

        selectedItems = [];
        navigate("/cart"); // обновит header и страницу
      });
    }
  };

  const loadCart = async () => {
    handlersSetup = false;

    const itemsContainer = container.querySelector("#cart-items") as HTMLElement;
    if (itemsContainer) {
      itemsContainer.innerHTML = `
        <div style="text-align: center; padding: 80px; color: #666;">
          <div style="font-size: 4rem;">🛒</div>
          <p>Загрузка корзины...</p>
        </div>
      `;
    }

    try {
      const res = await api.cart.get();
      const data = await handleResponse<{ items: { product: Product; quantity: number }[]; totalItems: number }>(res);

      cartData = { items: data.items };
      renderItems(data.items);
      setupEventHandlers();
      updateTotal();

      const selectAll = container.querySelector("#select-all") as HTMLInputElement;
      if (selectAll) {
        const allChecked = cartData.items.every(item => selectedItems.includes(item.product.id.toString()));
        selectAll.checked = allChecked;
      }
    } catch (err) {
      if (itemsContainer) {
        itemsContainer.innerHTML = `
          <div style="text-align: center; padding: 80px; color: #666;">
            <h3>Корзина пуста или требуется вход</h3>
            <p>Попробуйте войти заново</p>
            <a href="/login" style="color: #a78bfa; text-decoration: underline;">Вход</a>
          </div>
        `;
      }
      updateTotal();
    }
  };

  // Checkout button
  const checkoutBtn = container.querySelector("#checkout-btn") as HTMLButtonElement;
  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", () => {
      if (selectedItems.length === 0) return;
      localStorage.setItem("checkoutItems", JSON.stringify(selectedItems));
      navigate("/checkout");
    });
  }

  loadCart();

  return container;
};