import { mountGameApp } from "./app/gameApp";
import "./styles/theme.css";

const root = document.querySelector<HTMLElement>("#app");

if (!root) {
  throw new Error("Missing #app root element.");
}

mountGameApp(root);

