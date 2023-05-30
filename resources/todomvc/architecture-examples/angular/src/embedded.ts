import { platformBrowserDynamic } from "@angular/platform-browser-dynamic";

import { AppModule } from "./app/app.module";

import "../../../big-dom-generator/dist/app.css";
import "../../../big-dom-generator/public/layout.css";
import "../../../big-dom-generator/matchingCss.css";
import "../../../big-dom-generator/nonMatchingCss.css";

const divElement = document.createElement("div");
divElement.className = "todoholder";
const todoArea = document.querySelector(".todo-area");
if (todoArea)
    todoArea.appendChild(divElement);

platformBrowserDynamic()
    .bootstrapModule(AppModule)
    .catch((err) => console.error(err));
