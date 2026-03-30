import type { Product } from "../types/Product";
import { api, handleResponse } from "../services/api";
import { navigate, updateCartBadge } from "../router/router";

export const CheckoutPage = (): HTMLElement => {
  const container = document.createElement("div");
  container.className = "checkout-page";

  const selectedItems: string[] = JSON.parse(localStorage.getItem("checkoutItems") || "[]");

  // Если корзина пуста, редирект
  if (selectedItems.length === 0) {
    setTimeout(() => navigate("/cart"), 0);
    return container;
  }

  // --- Хелперы для создания элементов ---
  const createInputGroup = (labelText: string, inputElement: HTMLElement, isFullWidth: boolean = false) => {
    const group = document.createElement("div");
    group.className = "form-group";
    if (isFullWidth) group.classList.add("full-width");
    
    const label = document.createElement("label");
    label.textContent = labelText;
    
    group.append(label, inputElement);
    return group;
  };

  const createSummaryRow = (label: string, valueId: string, initialValue: string = "0 Br", className: string = "summary-row") => {
    const row = document.createElement("div");
    row.className = className;
    const labelSpan = document.createElement("span");
    labelSpan.textContent = label;
    const valueSpan = document.createElement("span");
    valueSpan.id = valueId;
    valueSpan.textContent = initialValue;
    row.append(labelSpan, valueSpan);
    return { row, valueSpan, labelSpan };
  };

  // --- Основная структура ---
  const checkoutContainer = document.createElement("div");
  checkoutContainer.className = "checkout-container";

  const title = document.createElement("h2");
  title.textContent = "Оформление заказа";

  const form = document.createElement("form");
  form.id = "checkout-form";
  form.className = "checkout-form"; // Grid: 1fr 380px по вашему CSS

  // --- ЛЕВАЯ КОЛОНКА: ДАННЫЕ (form-section) ---
  const formSection = document.createElement("div");
  formSection.className = "form-section";

  const phoneInput = document.createElement("input");
  phoneInput.type = "tel";
  phoneInput.required = true;
  phoneInput.placeholder = "+375 (__) ___-__-__";

  const emailInput = document.createElement("input");
  emailInput.type = "email";
  emailInput.required = true;
  emailInput.placeholder = "example@mail.com";

  const addressInput = document.createElement("textarea");
  addressInput.required = true;
  addressInput.rows = 3;
  addressInput.placeholder = "ул. Примерная, д. 123, кв. 45";

  // Оплата и доставка в один ряд
  const paymentSelect = document.createElement("select");
  paymentSelect.id = "payment-method";
  paymentSelect.add(new Option("💳 Картой онлайн", "card"));
  paymentSelect.add(new Option("💰 При получении", "cash"));

  const deliverySelect = document.createElement("select");
  deliverySelect.id = "delivery-method";
  deliverySelect.add(new Option("🚚 Курьером (15 Br)", "courier"));
  deliverySelect.add(new Option("🏪 Самовывоз (бесплатно)", "pickup"));

  const formRow = document.createElement("div");
  formRow.className = "form-row";
  formRow.append(
    createInputGroup("Способ оплаты", paymentSelect),
    createInputGroup("Доставка", deliverySelect)
  );

  const commentInput = document.createElement("textarea");
  commentInput.rows = 3;
  commentInput.placeholder = "Дополнительные пожелания...";

  // Собираем левую часть
  formSection.append(
    createInputGroup("Телефон *", phoneInput),
    createInputGroup("Email *", emailInput),
    createInputGroup("Адрес доставки *", addressInput, true),
    formRow,
    createInputGroup("Комментарий к заказу", commentInput, true)
  );

  // --- ПРАВАЯ КОЛОНКА: ИТОГ (order-summary) ---
  const summaryDiv = document.createElement("div");
  summaryDiv.className = "order-summary";

  const summaryTitle = document.createElement("h3");
  summaryTitle.className = "summary-title";
  summaryTitle.textContent = "Ваш заказ";

  const itemsListEl = document.createElement("div");
  itemsListEl.id = "order-items-list";
  itemsListEl.style.cssText = "max-height: 250px; overflow-y: auto; margin-bottom: 16px; padding-right: 8px;";

  const goodsRow = createSummaryRow("Товары (0 шт):", "order-total");
  const deliveryPriceRow = createSummaryRow("Доставка:", "delivery-price", "15 Br", "summary-row delivery-cost");
  const grandTotalRow = createSummaryRow("Итого к оплате:", "grand-total", "0 Br", "summary-row grand-total");

  const submitBtn = document.createElement("button");
  submitBtn.type = "submit";
  submitBtn.className = "confirm-order-btn";
  submitBtn.textContent = "Подтвердить заказ";

  summaryDiv.append(
    summaryTitle, 
    itemsListEl, 
    goodsRow.row, 
    deliveryPriceRow.row, 
    grandTotalRow.row, 
    submitBtn
  );

  // Сборка формы
  form.append(formSection, summaryDiv);
  checkoutContainer.append(title, form);
  container.append(checkoutContainer);

  // --- Логика данных ---
  let baseTotal = 0;

  const updateDeliveryDisplay = () => {
    const isPickup = deliverySelect.value === "pickup";
    const deliveryCost = isPickup ? 0 : 15;
    
    deliveryPriceRow.labelSpan.textContent = isPickup ? "Самовывоз" : "Доставка:";
    deliveryPriceRow.valueSpan.textContent = `${deliveryCost} Br`;
    grandTotalRow.valueSpan.textContent = `${(baseTotal + deliveryCost).toFixed(2)} Br`;
  };

  const loadData = async () => {
    try {
      const res = await api.cart.get();
      const data = await handleResponse<{ items: { product: Product; quantity: number }[] }>(res);
      const selected = data.items.filter(item => selectedItems.includes(item.product.id.toString()));

      baseTotal = selected.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
      const totalQty = selected.reduce((sum, item) => sum + item.quantity, 0);
      
      goodsRow.labelSpan.textContent = `Товары (${totalQty} шт):`;
      goodsRow.valueSpan.textContent = `${baseTotal.toFixed(2)} Br`;

      itemsListEl.innerHTML = ""; 
      selected.forEach(item => {
        const row = document.createElement("div");
        row.style.cssText = "display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f3f4f6;";

        const left = document.createElement("div");
        const n = document.createElement("span");
        n.style.fontWeight = "500";
        n.textContent = item.product.title;
        const q = document.createElement("span");
        q.style.cssText = "color: #666; font-size: 13px; margin-left: 8px;";
        q.textContent = `x${item.quantity}`;
        left.append(n, q);

        const p = document.createElement("span");
        p.style.cssText = "font-weight: 600; color: #ec4899;";
        p.textContent = `${(item.product.price * item.quantity).toFixed(2)} Br`;

        row.append(left, p);
        itemsListEl.append(row);
      });

      updateDeliveryDisplay();
    } catch (err) {
      goodsRow.valueSpan.textContent = "Ошибка";
    }
  };

  deliverySelect.addEventListener("change", updateDeliveryDisplay);

  // --- Отправка заказа ---
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    submitBtn.disabled = true;
    submitBtn.textContent = "Оформление...";

    const orderData = {
      deliveryAddress: addressInput.value,
      deliveryPhone: phoneInput.value,
      deliveryEmail: emailInput.value,
      paymentMethod: paymentSelect.value,
      selectedItems: selectedItems
    };

    try {
      const response = await api.orders.create(orderData);
      const result = await handleResponse<{ order: { id: string } }>(response);

      localStorage.removeItem("checkoutItems");
      await updateCartBadge();

      // Модалка
      const modal = document.createElement("div");
      modal.className = "success-modal";
      const content = document.createElement("div");
      content.className = "modal-content";

      const icon = document.createElement("div");
      icon.className = "success-icon";
      icon.textContent = "✅";

      const mTitle = document.createElement("h3");
      mTitle.textContent = "Заказ успешно оформлен!";

      const mDesc = document.createElement("p");
      mDesc.style.margin = "15px 0";
      mDesc.innerHTML = `Номер заказа: <strong>${result.order.id.slice(0, 8)}</strong>`;

      const closeBtn = document.createElement("button");
      closeBtn.id = "modal-close";
      closeBtn.textContent = "Продолжить покупки";
      closeBtn.onclick = () => {
        modal.remove();
        navigate("/");
      };

      content.append(icon, mTitle, mDesc, closeBtn);
      modal.append(content);
      document.body.append(modal);

    } catch (err: any) {
      submitBtn.disabled = false;
      submitBtn.textContent = "Подтвердить заказ";
      alert(`Ошибка: ${err.message}`);
    }
  });

  loadData();
  return container;
};