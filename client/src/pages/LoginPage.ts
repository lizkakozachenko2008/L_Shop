import { api, handleResponse } from "../services/api";
//import { navigate } from "../router/router";

export const LoginPage = (): HTMLElement => {
  const container = document.createElement("div");
  container.className = "login-page";

  container.innerHTML = `
    <h1>Lunar Glow</h1>
    <form data-registration class="auth-form">
      <h2 id="form-title">Вход</h2>
      <input type="text" id="name-input" placeholder="Имя" style="display: none;">
      <input type="email" id="email-input" placeholder="Email" required>
      <input type="tel" id="phone-input" placeholder="Телефон (опционально)" style="display: none;">
      <input type="password" id="password-input" placeholder="Пароль" required>
      <button type="submit" id="submit-btn">Войти</button>
      <p id="toggle-text">Нет аккаунта? <a href="#" id="toggle-link">Регистрация</a></p>
    </form>
  `;

  const form = container.querySelector("form")!;
  const nameInput = container.querySelector("#name-input") as HTMLInputElement;
  const phoneInput = container.querySelector("#phone-input") as HTMLInputElement;
  const emailInput = container.querySelector("#email-input") as HTMLInputElement;
  const passwordInput = container.querySelector("#password-input") as HTMLInputElement;
  const title = container.querySelector("#form-title")!;
  const submitBtn = container.querySelector("#submit-btn")!;
  const toggleLink = container.querySelector("#toggle-link") as HTMLAnchorElement;
  const toggleText = container.querySelector("#toggle-text")!;

  let isRegister = false;

  const updateToggleMode = () => {
    title.textContent = isRegister ? "Регистрация" : "Вход";
    nameInput.style.display = isRegister ? "block" : "none";
    phoneInput.style.display = isRegister ? "block" : "none";
    submitBtn.textContent = isRegister ? "Зарегистрироваться" : "Войти";
    toggleText.innerHTML = isRegister 
      ? "Уже есть аккаунт? <a href=\"#\" id=\"toggle-link\">Вход</a>" 
      : "Нет аккаунта? <a href=\"#\" id=\"toggle-link\">Регистрация</a>";
    
    // Перепривязываем listener к новому link (поскольку innerHTML перезаписывает элемент)
    const newToggleLink = toggleText.querySelector("#toggle-link") as HTMLAnchorElement;
    newToggleLink.addEventListener("click", (e) => {
      e.preventDefault();
      isRegister = !isRegister;
      updateToggleMode();
    });
  };

  toggleLink.addEventListener("click", (e) => {
    e.preventDefault();
    isRegister = !isRegister;
    updateToggleMode();
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (!email || !password) {
      alert("Заполните email и пароль");
      return;
    }

    try {
      if (isRegister) {
        const name = nameInput.value.trim();
        const phone = phoneInput.value.trim();
        if (!name) {
          alert("Заполните имя");
          return;
        }
        const res = await api.auth.register({ name, email, phone, password });
        await handleResponse(res);
      } else {
        const res = await api.auth.login({ email, password });
        await handleResponse(res);
      }
      location.reload(); // обновит страницу после успеха
      alert("Успешно!");
    } catch (err) {
      alert("Ошибка: неверные данные или email занят");
    }
  });

  return container;
};