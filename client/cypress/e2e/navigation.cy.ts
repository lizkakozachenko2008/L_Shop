// ============================================================
// E2E ТЕСТЫ — НАВИГАЦИЯ — Ломаем роутер!
// ============================================================

describe("Навигация по страницам", () => {
  it("загружает главную страницу /", () => {
    cy.visit("/");
    cy.get("#app").should("exist");
  });

  it("на главной странице есть заголовок Lunar Glow или контент", () => {
    cy.visit("/");
    cy.get("#app").should("not.be.empty");
  });

  it("переход на /login — страница логина", () => {
    cy.visit("/login");
    cy.get("#app").should("not.be.empty");
  });

  it("переход на /cart — страница корзины", () => {
    cy.visit("/cart");
    cy.get("#app").should("not.be.empty");
  });

  it("переход на /checkout — редиректит (нет выбранных товаров)", () => {
    cy.visit("/checkout");
    // Без выбранных товаров должен редиректить на /cart
    cy.url().should("include", "/cart");
  });

  // ---- ЛОМАЕМ! ----

  it("несуществующий роут показывает 404", () => {
    cy.visit("/абракадабра");
    cy.get("#app").should("contain", "404");
  });

  it("глубокий несуществующий URL показывает 404", () => {
    cy.visit("/a/b/c/d/e");
    cy.get("#app").should("contain", "404");
  });

  it("роут с Unicode показывает 404", () => {
    cy.visit("/привет-мир");
    cy.get("#app").should("contain", "404");
  });

  it("роут с XSS в URL не крашит приложение", () => {
    cy.visit("/<script>alert(1)</script>");
    cy.get("#app").should("exist");
  });

  it("роут с SQL injection в URL не крашит приложение", () => {
    cy.visit("/' OR 1=1 --");
    cy.get("#app").should("exist");
  });

  it("множественные быстрые переходы не крашат приложение", () => {
    cy.visit("/");
    for (let i = 0; i < 5; i++) {
      cy.visit("/login");
      cy.visit("/");
      cy.visit("/cart");
    }
    cy.get("#app").should("exist");
  });
});
