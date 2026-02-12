import type { Product } from "../types/Product";
import { api, handleResponse } from "../services/api";
import { navigate, updateCartBadge } from "../router/router";

export const CheckoutPage = (): HTMLElement => {
  const container = document.createElement("div");
  container.className = "checkout-page";

  const selectedItems = JSON.parse(localStorage.getItem("checkoutItems") || "[]");
  
  // ✅ Если нет выбранных товаров - редирект в корзину
  if (selectedItems.length === 0) {
    navigate("/cart");
    return container;
  }

  container.innerHTML = `
    <div class="checkout-container">
      <h2>Оформление заказа</h2>
      
      <div class="checkout-content">
        <form class="checkout-form" data-delivery-form id="checkout-form">
          <div class="form-group">
            <label>Телефон *</label>
            <input data-delivery-phone type="tel" id="phone" required placeholder="+375 (29) 123-45-67">
          </div>
          <div class="form-group">
            <label>Email *</label>
            <input data-delivery-email type="email" id="email" required placeholder="example@mail.com">
          </div>
          <div class="form-group">
            <label>Адрес доставки *</label>
            <textarea data-delivery-address id="address" required rows="3" placeholder="ул. Примерная, д. 123, кв. 45"></textarea>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Способ оплаты</label>
              <select data-delivery-payment id="payment-method">
                <option value="card">💳 Картой онлайн</option>
                <option value="cash">💰 При получении</option>
              </select>
            </div>
            <div class="form-group">
              <label>Доставка</label>
              <select data-delivery-method id="delivery-method">
                <option value="courier">🚚 Курьером (15 ₽)</option>
                <option value="pickup">🏪 Самовывоз (бесплатно)</option>
              </select>
            </div>
          </div>
          <div class="form-group">
            <label>Комментарий к заказу</label>
            <textarea id="comment" rows="3" placeholder="Дополнительные пожелания..."></textarea>
          </div>
          
          <div class="order-summary">
            <h3 class="summary-title">Ваш заказ</h3>
            <div id="order-items-list" style="max-height: 200px; overflow-y: auto; margin-bottom: 16px;"></div>
            
            <div class="summary-row">
              <span>Товары (<span id="items-count">0</span> шт):</span>
              <span id="order-total">0 ₽</span>
            </div>
            <div class="summary-row delivery-cost">
              <span id="delivery-text">Доставка:</span>
              <span id="delivery-price">15 ₽</span>
            </div>
            <div class="summary-row grand-total">
              <span>Итого к оплате:</span>
              <span id="grand-total">15 ₽</span>
            </div>
          </div>
          
          <button type="submit" class="confirm-order-btn">Подтвердить заказ</button>
        </form>
      </div>
    </div>
  `;

  // Загрузка суммы из корзины (ТОЛЬКО выбранных товаров)
  const loadOrderTotal = async () => {
    try {
      const res = await api.cart.get();
      const data = await handleResponse<{ items: { product: Product; quantity: number }[] }>(res);
      
      // ✅ Фильтруем только выбранные товары
      const selected = data.items.filter(item => 
        selectedItems.includes(item.product.id.toString())
      );
      
      const total = selected.reduce((sum: number, item) => 
        sum + item.product.price * item.quantity, 0
      );

      // ✅ Отображаем список выбранных товаров
      const itemsListEl = container.querySelector("#order-items-list");
      if (itemsListEl) {
        itemsListEl.innerHTML = selected.map(item => `
          <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f3f4f6;">
            <div>
              <span style="font-weight: 500;">${item.product.title}</span>
              <span style="color: #666; font-size: 14px; margin-left: 8px;">x${item.quantity}</span>
            </div>
            <span style="font-weight: 600; color: #ec4899;">${(item.product.price * item.quantity).toFixed(2)} ₽</span>
          </div>
        `).join('');
      }

      // ✅ Обновляем счетчик товаров
      const itemsCountEl = container.querySelector("#items-count");
      if (itemsCountEl) {
        itemsCountEl.textContent = selected.reduce((sum, item) => sum + item.quantity, 0).toString();
      }
      
      const deliveryMethod = container.querySelector("#delivery-method") as HTMLSelectElement;
      if (!deliveryMethod) return;

      const updateDeliveryCost = () => {
        const deliveryCost = deliveryMethod.value === "pickup" ? 0 : 15;
        const deliveryText = deliveryMethod.value === "pickup" ? "Самовывоз" : "Доставка";

        const orderTotalEl = container.querySelector("#order-total") as HTMLElement;
        const deliveryTextEl = container.querySelector("#delivery-text") as HTMLElement;
        const deliveryPriceEl = container.querySelector("#delivery-price") as HTMLElement;
        const grandTotalEl = container.querySelector("#grand-total") as HTMLElement;

        if (orderTotalEl) orderTotalEl.textContent = `${total.toFixed(2)} ₽`;
        if (deliveryTextEl) deliveryTextEl.textContent = deliveryText;
        if (deliveryPriceEl) deliveryPriceEl.textContent = `${deliveryCost} ₽`;
        if (grandTotalEl) grandTotalEl.textContent = `${(total + deliveryCost).toFixed(2)} ₽`;
      };
      
      updateDeliveryCost();
      deliveryMethod.addEventListener("change", updateDeliveryCost);
      
    } catch (err) {
      console.error("Ошибка загрузки корзины:", err);
      const orderTotalEl = container.querySelector("#order-total");
      if (orderTotalEl) orderTotalEl.textContent = "Ошибка загрузки";
    }
  };

  // Подтверждение заказа - отправляем selectedItems на сервер!
  const form = container.querySelector("#checkout-form") as HTMLFormElement;
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      
      // ✅ БЛОКИРУЕМ КНОПКУ, ЧТОБЫ НЕ БЫЛО ДВОЙНОГО ОТПРАВЛЕНИЯ
      const submitBtn = form.querySelector(".confirm-order-btn") as HTMLButtonElement;
      submitBtn.disabled = true;
      submitBtn.textContent = "Оформление...";
      
      const orderData = {
        deliveryAddress: (container.querySelector("#address") as HTMLTextAreaElement).value,
        deliveryPhone: (container.querySelector("#phone") as HTMLInputElement).value,
        deliveryEmail: (container.querySelector("#email") as HTMLInputElement).value,
        paymentMethod: (container.querySelector("#payment-method") as HTMLSelectElement).value,
        selectedItems: selectedItems // ✅ ОТПРАВЛЯЕМ ВЫБРАННЫЕ ТОВАРЫ НА СЕРВЕР!
      };

      try {
        // ✅ 1. Создаем заказ - сервер сам:
        //    - Проверит наличие
        //    - Уменьшит stock
        //    - Удалит ТОЛЬКО выбранные товары из корзины
        const response = await api.orders.create(orderData);
        const result = await handleResponse<{ 
          message: string; 
          order: { id: string; totalAmount: number } 
        }>(response);
        
        // ✅ 2. Очищаем localStorage от выбранных товаров
        localStorage.removeItem("checkoutItems");
        localStorage.removeItem("cartSelectedItems");
        
        // ✅ 3. Обновляем счетчик корзины в хедере
        await updateCartBadge();

        // ✅ 4. Показываем модальное окно успеха
        const modal = document.createElement("div");
        modal.className = "success-modal";
        modal.innerHTML = `
          <div class="modal-content">
            <div class="success-icon">✅</div>
            <h3>Заказ успешно оформлен!</h3>
            <p style="margin: 16px 0;">Номер заказа: <strong>${result.order.id.slice(0, 8)}</strong></p>
            <p style="color: #666; font-size: 14px; margin-bottom: 16px;">
              Товары списаны со склада и удалены из корзины
            </p>
            <button id="modal-close" class="modal-close-btn">Продолжить покупки</button>
          </div>
        `;
        
        document.body.appendChild(modal);
        
        const closeBtn = modal.querySelector("#modal-close") as HTMLButtonElement;
        if (closeBtn) {
          closeBtn.addEventListener("click", () => {
            modal.remove();
            navigate("/"); // ✅ На главную, а не в корзину
          });
        }
        
      } catch (err: any) {
        // ✅ РАЗБЛОКИРУЕМ КНОПКУ ПРИ ОШИБКЕ
        submitBtn.disabled = false;
        submitBtn.textContent = "Подтвердить заказ";
        
        // ✅ ПАРСИМ ОШИБКУ С СЕРВЕРА
        let errorMessage = "Ошибка при оформлении заказа";
        
        if (err.message) {
          try {
            const errorData = JSON.parse(err.message);
            errorMessage = errorData.message || err.message;
          } catch {
            errorMessage = err.message;
          }
        }
        
        // ✅ ПОКАЗЫВАЕМ ПОНЯТНУЮ ОШИБКУ
        if (errorMessage.includes("Недостаточно товара")) {
          alert(`❌ ${errorMessage}\n\nОбновите корзину и уменьшите количество товаров.`);
          navigate("/cart"); // Отправляем в корзину исправлять количество
        } else {
          alert(`❌ ${errorMessage}`);
        }
        
        console.error("Order creation error:", err);
      }
    });
  }

  loadOrderTotal();
  return container;
};