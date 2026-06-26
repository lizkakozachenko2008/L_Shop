// ============================================================
// E2E ТЕСТЫ — АВТОРИЗАЦИЯ — Ломаем логин/регистрацию!
// ============================================================

describe("Страница логина/регистрации", () => {
  beforeEach(() => {
    cy.visit("/login");
  });

  it("отображает форму логина", () => {
    cy.get("form").should("exist");
    cy.get('input[type="email"]').should("exist");
    cy.get('input[type="password"]').should("exist");
    cy.get('button[type="submit"]').should("exist");
  });

  it("переключение на регистрацию показывает поле имени", () => {
    cy.get("a").contains("Регистрация").click();
    cy.get('input[type="text"]').should("be.visible");
  });

  it("переключение туда-обратно", () => {
    cy.get("a").contains("Регистрация").click();
    cy.get("a").contains("Вход").click();
    cy.get('input[type="text"]').should("not.be.visible");
  });

  // ---- ЛОМАЕМ! ----

  it("пустые поля — кнопка не отправляет (required)", () => {
    // HTML5 валидация должна предотвратить отправку
    cy.get('button[type="submit"]').click();
    // Форма не отправляется — остаёмся на странице
    cy.url().should("include", "/login");
  });

  it("неверный email格式 — HTML5 валидация", () => {
    cy.get('input[type="email"]').type("notanemail");
    cy.get('input[type="password"]').type("password123");
    cy.get('button[type="submit"]').click();
    // HTML5 validation email — остаёмся
    cy.url().should("include", "/login");
  });

  it("очень длинный email не крашит", () => {
    cy.get('input[type="email"]').type("x".repeat(500) + "@test.com");
    cy.get('input[type="password"]').type("password123");
    cy.get('button[type="submit"]').click();
    cy.get("#app").should("exist");
  });

  it("очень длинный пароль не крашит", () => {
    cy.get('input[type="email"]').type("test@test.com");
    cy.get('input[type="password"]').type("x".repeat(1000));
    cy.get('button[type="submit"]').click();
    cy.get("#app").should("exist");
  });

  it("XSS в полях не крашит", () => {
    cy.get('input[type="email"]').type('<script>alert(1)</script>@test.com');
    cy.get('input[type="password"]').type('<script>alert(1)</script>');
    cy.get('button[type="submit"]').click();
    cy.get("#app").should("exist");
  });

  it("SQL injection в email не крашит", () => {
    cy.get('input[type="email"]').type("' OR 1=1 --");
    cy.get('input[type="password"]').type("whatever");
    cy.get('button[type="submit"]').click();
    cy.get("#app").should("exist");
  });

  it("спецсимволы в пароле не крашат", () => {
    cy.get('input[type="email"]').type("test@test.com");
    cy.get('input[type="password"]').type('p@$$w0rd!#"\'\\');
    cy.get('button[type="submit"]').click();
    cy.get("#app").should("exist");
  });

  it("регистрация без имени — alert", () => {
    cy.get("a").contains("Регистрация").click();
    cy.get('input[type="email"]').type("new@test.com");
    cy.get('input[type="password"]').type("password123");
    // Имя не заполнено
    cy.get('button[type="submit"]').click();
    cy.get("#app").should("exist");
  });

  it("множественные быстрые клики кнопки submit не крашат", () => {
    cy.get('input[type="email"]').type("test@test.com");
    cy.get('input[type="password"]').type("password123");
    // Тройной клик
    cy.get('button[type="submit"]').click().click().click();
    cy.get("#app").should("exist");
  });
});

describe("Аватар/Хедер: авторизованный vs гость", () => {
  it("как гость — видим 'Вход / Регистрация' в хедере", () => {
    cy.visit("/");
    cy.get("header").should("contain", "Вход");
  });
});
