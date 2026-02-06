import "./style.css";
import { LoginPage } from "./pages/LoginPage";
import { render } from "./utils/render";

const app = document.getElementById("app") as HTMLElement;

render(LoginPage(), app);