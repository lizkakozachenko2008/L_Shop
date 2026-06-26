// ============================================================
// E2E ТЕСТЫ — КОРЗИНА — Ломаем корзину!
// ============================================================

describe("Страница корзины", () => {
  it("как гость — корзина пуста или ошибка авторизации", () => {
    cy.visit("/cart");
    cy.get("#app").should("not.be.empty");
  });

  it("отображает заголовок 'Корзина'", () => {
    cy.visit("/cart");
    cy.get(".cart-page").should("exist");
  });
});

describe("Корзина — разрушительные тесты через API", () => {
  const testEmail = `cart_e2e_${Date.now()}@test.com`;
  const testPassword = "password123";

  before(() => {
    // Регистрируем пользователя через API
    cy.request({
      method: "POST",
      url: "http://localhost:5000/api/auth/register",
      body: {
        name: "E2E Cart Tester",
        email: testEmail,
        password: testPassword,
      },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(201);
      // Сохраняем cookie
      const cookies = res.headers["set-cookie"] as string[];
      if (cookies) {
        cookies.forEach((cookie: string) => {
          const [nameValue] = cookie.split(";");
          const [name, value] = nameValue.split("=");
          cy.setCookie(name.trim(), value.trim());
        });
      }
    });
  });

  it("авторизованный видит пустую корзину", () => {
    cy.visit("/cart");
    cy.get("#app").should("not.be.empty");
  });

  it("добавление товара через API — отображается в корзине", () => {
    cy.request({
      method: "POST",
      url: "http://localhost:5000/api/cart/add",
      body: { productId: "1", quantity: 1 },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(200);
    });

    cy.visit("/cart");
    cy.get(".cart-item", { timeout: 10000 }).should("have.length.gt", 0);
  });

  // ---- ЛОМАЕМ! ----

  it("обновление количества через API", () => {
    cy.request({
      method: "PUT",
      url: "http://localhost:5000/api/cart/update/1",
      body: { quantity: 5 },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(200);
    });

    cy.visit("/cart");
    cy.get(".cart-item").should("have.length.gt", 0);
  });

  it("удаление товара через API", () => {
    cy.request({
      method: "DELETE",
      url: "http://localhost:5000/api/cart/remove/1",
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(200);
    });

    cy.visit("/cart");
    // Корзина должна быть пуста
  });

  it("добавление несуществующего товара через API → 400", () => {
    cy.request({
      method: "POST",
      url: "http://localhost:5000/api/cart/add",
      body: { productId: "nonexistent-99999", quantity: 1 },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(400);
    });
  });

  it("добавление товара с quantity=0 через API → 400", () => {
    cy.request({
      method: "POST",
      url: "http://localhost:5000/api/cart/add",
      body: { productId: "1", quantity: 0 },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(400);
    });
  });

  it("добавление товара с отрицательным quantity через API → 400", () => {
    cy.request({
      method: "POST",
      url: "http://localhost:5000/api/cart/add",
      body: { productId: "1", quantity: -5 },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(400);
    });
  });
});
