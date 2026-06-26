// Cypress support file
// Добавляем кастомные команды и глобальные хуки

beforeEach(() => {
  // Очищаем куки и localStorage перед каждым тестом
  cy.clearCookies();
  cy.clearLocalStorage();
});

// Кастомная команда: логин через API
Cypress.Commands.add("loginViaAPI", (email: string, password: string) => {
  cy.request({
    method: "POST",
    url: "http://localhost:5000/api/auth/login",
    body: { email, password },
    failOnStatusCode: false,
  }).then((response) => {
    if (response.status === 200) {
      // Устанавливаем cookie вручную
      const cookies = response.headers["set-cookie"] as string[];
      if (cookies) {
        cookies.forEach((cookie: string) => {
          const [nameValue] = cookie.split(";");
          const [name, value] = nameValue.split("=");
          cy.setCookie(name.trim(), value.trim());
        });
      }
    }
  });
});

// Кастомная команда: регистрация через API
Cypress.Commands.add("registerViaAPI", (name: string, email: string, password: string) => {
  cy.request({
    method: "POST",
    url: "http://localhost:5000/api/auth/register",
    body: { name, email, password },
    failOnStatusCode: false,
  });
});

declare global {
  namespace Cypress {
    interface Chainable {
      loginViaAPI(email: string, password: string): Chainable<void>;
      registerViaAPI(name: string, email: string, password: string): Chainable<void>;
    }
  }
}

export {};
