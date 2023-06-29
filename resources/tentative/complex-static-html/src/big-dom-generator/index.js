import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { App } from "./app";
import { genCss } from "./gen-css";

import "./app.css";

const fs = require("fs");

const randomCss = genCss();
fs.writeFileSync("src/react-todomvc/public/generated.css", randomCss);

const html = `<!DOCTYPE html>
<html lang="en" class="spectrum spectrum--medium spectrum--light">
  <head>
    <title>Big Todo App</title>
  </head>
  <body>
    ${renderToStaticMarkup(<App />)}
  </body>
</html>`;
fs.writeFileSync("generator-dist/index.html", html);
