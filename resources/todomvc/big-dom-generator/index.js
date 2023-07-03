import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { App } from "./src/app";
import { genCss } from "./gen-css";

import "./src/app.css";

const fs = require("fs");

const randomCss = `${genCss()}\n`;
fs.writeFileSync("./generated.css", randomCss);

const html = `<!DOCTYPE html>
<html lang="en" class="spectrum spectrum--medium spectrum--light">
  <head>
    <title>Big Todo App</title>
    <script src="app.bundle.js"></script>
    <link rel="stylesheet" href="app.css">
  </head>
  <body>
    ${renderToStaticMarkup(<App />)}
  </body>
</html>`;
fs.writeFileSync("dist/index.html", html);
