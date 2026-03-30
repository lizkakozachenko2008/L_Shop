import { api, handleResponse } from "../services/api";
import { navigate } from "../router/router";

export const LoginPage = (): HTMLElement => {
  const container = document.createElement("div");
  container.className = "login-page";

  const checkAuthAndRedirect = async () => {
    try {
      const res = await api.auth.me();
      await handleResponse(res);
      navigate("/");
    } catch {
    }
  };

  checkAuthAndRedirect();
  const logo = document.createElement("h1");
  logo.textContent = "Lunar Glow";

  const form = document.createElement("form");
  form.className = "auth-form";

  const title = document.createElement("h2");
  title.textContent = "Вход";

  const nameInput = document.createElement("input");
  nameInput.type = "text";
  nameInput.placeholder = "Имя";
  nameInput.style.display = "none";

  const emailInput = document.createElement("input");
  emailInput.type = "email";
  emailInput.placeholder = "Email";
  emailInput.required = true;

  const phoneInput = document.createElement("input");
  phoneInput.type = "tel";
  phoneInput.placeholder = "Телефон (опционально)";
  phoneInput.style.display = "none";

  const passwordInput = document.createElement("input");
  passwordInput.type = "password";
  passwordInput.placeholder = "Пароль";
  passwordInput.required = true;

  const submitBtn = document.createElement("button");
  submitBtn.type = "submit";
  submitBtn.textContent = "Войти";

  const toggleText = document.createElement("p");
  const toggleLink = document.createElement("a");
  toggleLink.href = "#";
  toggleLink.textContent = "Регистрация";

  const prefixText = document.createTextNode("Нет аккаунта? ");
  toggleText.append(prefixText, toggleLink);

  form.append(title, nameInput, emailInput, phoneInput, passwordInput, submitBtn, toggleText);
  container.append(logo, form);

  let isRegister = false;

  const updateToggleMode = () => {
    isRegister = !isRegister;

    title.textContent = isRegister ? "Регистрация" : "Вход";
    submitBtn.textContent = isRegister ? "Зарегистрироваться" : "Войти";
    
    const displayMode = isRegister ? "block" : "none";
    nameInput.style.display = displayMode;
    phoneInput.style.display = displayMode;
    
    prefixText.textContent = isRegister ? "Уже есть аккаунт? " : "Нет аккаунта? ";
    toggleLink.textContent = isRegister ? "Вход" : "Регистрация";
  };

  toggleLink.addEventListener("click", (e) => {
    e.preventDefault();
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
      
      navigate("/"); 
      
    } catch (err: any) {
      alert(err.message || "Ошибка: неверные данные или email занят");
    }
  });

  return container;
};