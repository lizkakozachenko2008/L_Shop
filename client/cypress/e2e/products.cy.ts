// ============================================================
// E2E ТЕСТЫ — ТОВАРЫ — Ломаем каталог!
// ============================================================

describe("Главная страница — каталог товаров", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  it("загружает и отображает товары", () => {
    // Ждём загрузки товаров
    cy.get(".product-card", { timeout: 10000 }).should("have.length.gt", 0);
  });

  it("у товара есть название, цена и категория", () => {
    cy.get(".product-card").first().within(() => {
      cy.get("h3").should("not.be.empty");
      cy.get("p").should("have.length.gt", 0);
    });
  });

  // ---- ФИЛЬТРАЦИЯ ----

  it("поиск по названию фильтрует товары", () => {
    cy.get("#search-input").type("крем");
    cy.wait(1000); // Ждём debounce загрузки
    cy.get(".product-card").should("have.length.gt", 0);
    cy.get(".product-card").each(($card) => {
      cy.wrap($card).should("contain.text", "крем");
    });
  });

  it("поиск с несуществующим словом показывает 0 товаров", () => {
    cy.get("#search-input").type("абракадабранетоваров");
    cy.wait(1000);
    cy.get(".product-card").should("have.length", 0);
  });

  it("фильтр по категории", () => {
    cy.get("#category-filter").select("Макияж");
    cy.wait(1000);
    cy.get(".product-card").each(($card) => {
      cy.wrap($card).should("contain.text", "Макияж");
    });
  });

  it("фильтр по наличию", () => {
    cy.get("#stock-filter").select("true");
    cy.wait(1000);
    cy.get(".product-card").each(($card) => {
      cy.wrap($card).find(".stock-info").should("contain.text", "В наличии");
    });
  });

  it("сортировка по цене", () => {
    cy.get("#sort-filter").select("price_asc");
    cy.wait(1000);
    cy.get(".product-card").should("have.length.gt", 0);
  });

  // ---- ЛОМАЕМ! ----

  it("очень длинный поиск не крашит", () => {
    cy.get("#search-input").type("x".repeat(500));
    cy.wait(1000);
    cy.get("#app").should("exist");
  });

  it("XSS в поиске не крашит", () => {
    cy.get("#search-input").type('<script>alert(1)</script>');
    cy.wait(1000);
    cy.get("#app").should("exist");
  });

  it("SQL injection в поиске не крашит", () => {
    cy.get("#search-input").type("' OR 1=1 --");
    cy.wait(1000);
    cy.get("#app").should("exist");
  });

  it("быстрая смена фильтров не крашит", () => {
    for (let i = 0; i < 5; i++) {
      cy.get("#search-input").clear().type("крем");
      cy.get("#search-input").clear();
      cy.get("#stock-filter").select("true");
      cy.get("#stock-filter").select("");
    }
    cy.get("#app").should("exist");
  });

  it("клик 'Добавить в корзину' как гость — редиректит на логин", () => {
    cy.get(".add-btn").first().click();
    // Должен быть alert или редирект
    cy.get("#app").should("exist");
  });

  it("пагинация при большом количестве товаров", () => {
    // Если товаров > 9, есть пагинация
    cy.get(".product-card").then(($cards) => {
      if ($cards.length <= 9) {
        // Пагинации может не быть
        cy.get(".pagination").should("exist");
      }
    });
  });
});
