import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { App } from "./src/app";
import { genCss } from "./gen-css";

import "./src/app.css";

const fs = require("fs");

const randomCss = genCss();
fs.writeFileSync("./matchingCss.css", randomCss.matchingCss);
fs.writeFileSync("./nonMatchingCss.css", randomCss.nonMatchingCss);

const html = `<!DOCTYPE html>
<html lang="en" class="spectrum spectrum--medium spectrum--light">
  <head>
    <title>Big Todo App</title>
  </head>
  <body>
    ${renderToStaticMarkup(<App />)}
  </body>
</html>`;
fs.writeFileSync("dist/index.html", html);
