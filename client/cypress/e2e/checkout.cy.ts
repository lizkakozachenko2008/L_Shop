// ============================================================
// E2E ТЕСТЫ — ОФОРМЛЕНИЕ ЗАКАЗА — Ломаем чекаут!
// ============================================================

describe("Страница оформления заказа", () => {
  it("без выбранных товаров — редиректит на /cart", () => {
    cy.visit("/checkout");
    cy.url().should("include", "/cart");
  });

  it("прямой URL /checkout без localStorage → редирект", () => {
    cy.clearLocalStorage();
    cy.visit("/checkout");
    cy.url().should("include", "/cart");
  });
});

describe("Полный флоу: регистрация → корзина → заказ", () => {
  const uniqueEmail = `fullflow_${Date.now()}@test.com`;
  const password = "password123";

  it("полный путь покупки (integration flow)", () => {
    // 1. Регистрация через API
    cy.request({
      method: "POST",
      url: "http://localhost:5000/api/auth/register",
      body: { name: "Full Flow User", email: uniqueEmail, password },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(201);
      const cookies = res.headers["set-cookie"] as string[];
      if (cookies) {
        cookies.forEach((cookie: string) => {
          const [nameValue] = cookie.split(";");
          const [name, value] = nameValue.split("=");
          cy.setCookie(name.trim(), value.trim());
        });
      }
    });

    // 2. Добавляем товар в корзину через API
    cy.request({
      method: "POST",
      url: "http://localhost:5000/api/cart/add",
      body: { productId: "1", quantity: 2 },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(200);
    });

    // 3. Посещаем корзину
    cy.visit("/cart");
    cy.get(".cart-item", { timeout: 10000 }).should("have.length.gt", 0);

    // 4. Выбираем товар
    cy.get(".item-select").check();
    cy.get("#checkout-btn").should("not.be.disabled");

    // 5. Нажимаем "Оформить заказ"
    cy.get("#checkout-btn").click();

    // 6. Мы на странице чекаута
    cy.url().should("include", "/checkout");

    // 7. Заполняем форму
    cy.get('input[type="tel"]').type("+375291234567");
    cy.get('input[type="email"]').type("test@test.com");
    cy.get("textarea").first().type("ул. Тестовая, д. 1");

    // 8. Отправляем заказ
    cy.get(".confirm-order-btn").click();

    // 9. Должен быть модал успеха
    cy.get(".success-modal", { timeout: 10000 }).should("exist");
  });
});

describe("Чекаут — разрушительные тесты", () => {
  it("модификация localStorage с некорректными данными", () => {
    cy.window().then((win) => {
      win.localStorage.setItem("checkoutItems", "not-an-array");
    });
    cy.visit("/checkout");
    cy.get("#app").should("exist");
  });

  it("localStorage с пустым массивом → редирект на /cart", () => {
    cy.window().then((win) => {
      win.localStorage.setItem("checkoutItems", "[]");
    });
    cy.visit("/checkout");
    cy.url().should("include", "/cart");
  });

  it("localStorage с несуществующими ID товаров", () => {
    cy.window().then((win) => {
      win.localStorage.setItem("checkoutItems", '["fake-id-1", "fake-id-2"]');
    });
    cy.visit("/checkout");
    cy.get("#app").should("exist");
  });

  it("localStorage с огромным массивом", () => {
    cy.window().then((win) => {
      const ids = Array.from({ length: 10000 }, (_, i) => `id-${i}`);
      win.localStorage.setItem("checkoutItems", JSON.stringify(ids));
    });
    cy.visit("/checkout");
    cy.get("#app").should("exist");
  });

  it("localStorage с XSS", () => {
    cy.window().then((win) => {
      win.localStorage.setItem(
        "checkoutItems",
        '["<script>alert(1)</script>"]'
      );
    });
    cy.visit("/checkout");
    cy.get("#app").should("exist");
  });
});
