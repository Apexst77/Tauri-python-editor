import { initMonaco } from "./ui/initMonaco.js";
import { initWindowControls } from "./ui/initTitleBar.js";

document.addEventListener("DOMContentLoaded", () => {
  initWindowControls();
  initMonaco();
});

