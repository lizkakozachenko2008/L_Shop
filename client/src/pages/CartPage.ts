import type { Product } from "../types/Product";
import { api, handleResponse } from "../services/api";
import { navigate, updateCartBadge } from "../router/router";

export const CartPage = (): HTMLElement => {
  const container = document.createElement("div");
  container.className = "cart-page";

  let selectedItems: string[] = JSON.parse(localStorage.getItem("cartSelectedItems") || "[]");
  let cartData: { items: { product: Product; quantity: number }[] } = { items: [] };

  const header = document.createElement("div");
  header.className = "cart-header";
  
  const title = document.createElement("h2");
  title.textContent = "🛒 Корзина";
  
  const actions = document.createElement("div");
  actions.className = "cart-actions";
  
  const selectAllLabel = document.createElement("label");
  selectAllLabel.className = "select-all";
  const selectAllCheckbox = document.createElement("input");
  selectAllCheckbox.type = "checkbox";
  selectAllCheckbox.id = "select-all";
  selectAllLabel.append(selectAllCheckbox, document.createTextNode(" Выбрать все"));
  
  const deleteSelectedBtn = document.createElement("button");
  deleteSelectedBtn.id = "delete-selected";
  deleteSelectedBtn.className = "delete-selected-btn";
  deleteSelectedBtn.textContent = "Удалить выбранные";
  deleteSelectedBtn.disabled = true;

  actions.append(selectAllLabel, deleteSelectedBtn);
  header.append(title, actions);

  const layout = document.createElement("div");
  layout.className = "cart-layout";

  const itemsSection = document.createElement("div");
  itemsSection.className = "cart-items-section";
  const itemsContainer = document.createElement("div");
  itemsContainer.className = "cart-items";
  itemsContainer.id = "cart-items";
  itemsSection.append(itemsContainer);

  const summarySection = document.createElement("div");
  summarySection.className = "cart-summary";
  const totalBox = document.createElement("div");
  totalBox.className = "total-section";

  const createTotalRow = (label: string, valueId: string) => {
    const row = document.createElement("div");
    row.className = "total-row";
    const spanLabel = document.createElement("span");
    spanLabel.textContent = label;
    const spanValue = document.createElement("span");
    spanValue.id = valueId;
    spanValue.textContent = "0";
    row.append(spanLabel, spanValue);
    return spanValue;
  };

  const countVal = createTotalRow("Выбрано товаров:", "selected-count");
  const totalVal = createTotalRow("Итого:", "cart-total");
  totalVal.className = "grand-total";

  const checkoutBtn = document.createElement("button");
  checkoutBtn.id = "checkout-btn";
  checkoutBtn.className = "checkout-btn-large";
  checkoutBtn.textContent = "Оформить заказ";
  checkoutBtn.disabled = true;

  totalBox.append(countVal.parentElement!, totalVal.parentElement!, checkoutBtn);
  summarySection.append(totalBox);
  layout.append(itemsSection, summarySection);
  container.append(header, layout);

  const updateTotal = () => {
    const selected = cartData.items.filter(item => selectedItems.includes(item.product.id.toString()));
    const total = selected.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

    totalVal.textContent = `${total.toFixed(2)} Br`;
    countVal.textContent = `${selected.length}`;
    
    const hasSelected = selected.length > 0;
    checkoutBtn.disabled = !hasSelected;
    deleteSelectedBtn.disabled = !hasSelected;

    localStorage.setItem("cartSelectedItems", JSON.stringify(selectedItems));
    
    selectAllCheckbox.checked = cartData.items.length > 0 && selectedItems.length === cartData.items.length;
  };

  const renderItems = () => {
    itemsContainer.innerHTML = "";

    if (cartData.items.length === 0) {
      const emptyMsg = document.createElement("div");
      emptyMsg.style.cssText = "text-align: center; padding: 60px; color: #666;";
      emptyMsg.innerHTML = `<div style="font-size: 3rem;">🛒</div><h3>Корзина пуста</h3>`;
      const goHome = document.createElement("button");
      goHome.textContent = "На главную";
      goHome.style.cssText = "margin-top: 15px; cursor: pointer; color: #a78bfa; border: none; background: none; text-decoration: underline;";
      goHome.onclick = () => navigate("/");
      emptyMsg.append(goHome);
      itemsContainer.append(emptyMsg);
      return;
    }

    cartData.items.forEach(item => {
      const id = item.product.id.toString();
      const card = document.createElement("div");
      card.className = "cart-item";

      const cbLabel = document.createElement("label");
      cbLabel.className = "item-checkbox";
      const cb = document.createElement("input");
      cb.type = "checkbox";
      cb.className = "item-select";
      cb.checked = selectedItems.includes(id);
      cb.onchange = () => {
        if (cb.checked) selectedItems.push(id);
        else selectedItems = selectedItems.filter(sid => sid !== id);
        updateTotal();
      };
      cbLabel.append(cb);

      const info = document.createElement("div");
      info.className = "item-info";
      const t = document.createElement("h3");
      t.textContent = item.product.title;
      const p = document.createElement("p");
      p.textContent = `${item.product.price.toFixed(2)} Br`;
      const s = document.createElement("p");
      s.style.cssText = "color: #666; font-size: 0.8rem;";
      s.textContent = `В наличии: ${item.product.stock}`;
      info.append(t, p, s);

      const controls = document.createElement("div");
      controls.className = "quantity-controls";
      
      const btnMinus = document.createElement("button");
      btnMinus.className = "qty-btn";
      btnMinus.textContent = "-";
      btnMinus.onclick = async () => {
        if (item.quantity > 1) {
          await api.cart.update(item.product.id, item.quantity - 1);
          loadCart(); 
        }
      };

      const qtyShow = document.createElement("span");
      qtyShow.className = "quantity";
      qtyShow.textContent = item.quantity.toString();

      const btnPlus = document.createElement("button");
      btnPlus.className = "qty-btn";
      btnPlus.textContent = "+";
      btnPlus.onclick = async () => {
        if (item.quantity < item.product.stock) {
          await api.cart.update(item.product.id, item.quantity + 1);
          loadCart();
        }
      };
      controls.append(btnMinus, qtyShow, btnPlus);

      const itemTotal = document.createElement("div");
      itemTotal.className = "item-total-price";
      itemTotal.textContent = `${(item.product.price * item.quantity).toFixed(2)} Br`;

      const removeBtn = document.createElement("button");
      removeBtn.className = "remove-btn";
      removeBtn.textContent = "×";
      removeBtn.onclick = async () => {
        await api.cart.remove(id);
        selectedItems = selectedItems.filter(sid => sid !== id);
        loadCart();
      };

      card.append(cbLabel, info, controls, itemTotal, removeBtn);
      itemsContainer.append(card);
    });
  };

  const loadCart = async () => {
    try {
      const res = await api.cart.get();
      const data = await handleResponse<{ items: { product: Product; quantity: number }[] }>(res);
      cartData.items = data.items;
      renderItems();
      updateTotal();
      updateCartBadge(); 
    } catch (err) {
      itemsContainer.textContent = "Ошибка загрузки корзины или требуется авторизация.";
    }
  };

  selectAllCheckbox.onchange = () => {
    if (selectAllCheckbox.checked) {
      selectedItems = cartData.items.map(i => i.product.id.toString());
    } else {
      selectedItems = [];
    }
    renderItems();
    updateTotal();
  };

  deleteSelectedBtn.onclick = async () => {
    if (!confirm("Удалить выбранные товары?")) return;
    for (const id of selectedItems) {
      await api.cart.remove(id);
    }
    selectedItems = [];
    loadCart();
  };

  checkoutBtn.onclick = () => {
    localStorage.setItem("checkoutItems", JSON.stringify(selectedItems));
    navigate("/checkout");
  };

  loadCart();
  return container;
};