import "./style.css";
import { Header } from "./components/Header";
import { LoginPage } from "./pages/LoginPage";
import { render } from "./utils/render";

const app = document.getElementById("app") as HTMLElement;

const init = async () => {
  const header = await Header();

  const main = document.createElement("main");
  main.className = "main-content";

  const page = LoginPage();

  render(header, app);
  render(page, main);
  app.appendChild(main);
};

init();